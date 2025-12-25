import { useEffect, useState } from 'react';
import { File, FileText, Download, Search, Plus, X, Tag, Calendar, Clock, Eye, Trash2 } from 'lucide-react';
import pdfFileIcon from "../assets/pdf-icon.png"
import imageFileIcon from "../assets/image-icon.png"
import fileIcon from "../assets/file-icon.png"
import textFileIcon from "../assets/text-file-icon.png"
import wordFileIcon from "../assets/word-file-icon.png"
import folderIcon from "../assets/folder-icon.png"
import icon from "../assets/cloud-vault.png"
import { useNavigate } from 'react-router-dom';
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import useStore from '../../store';
import defaultAvatar from "../assets/default-avatar.png"
import TextPreview from '../components/TextPreview';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [openDrawer, setOpenDrawer] = useState(false);
  const { userName, setUserRegisteredTime, isFirebaseGoogleAuthUser, setIsFirebaseGoogleAuthUser, isDarkMode, setTotalUploadedFile, setTotalUploadedFileSize, setTotalFileSizeUploadLimit, userImage, userEmail, setUserName, setUserEmail, setUserImage } = useStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [newFile, setNewFile] = useState({
    name: '',
    type: '',
    description: '',
    tags: '',
    size: '',
    file: null
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [docViewerDocs, setDocViewerDocs] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      console.log("User is authenticated via Firebase");
      setUserRegisteredTime(user.metadata.creationTime);
      const isGoogleUser = user?.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

      if (isGoogleUser) {
        console.log("User logged in using Google Auth");
        setIsFirebaseGoogleAuthUser(true);
      }

    } else {
      console.log("User is NOT authenticated via Firebase");
    }
  }, [auth]);

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
    } else {
      fetchFiles();
    }
  }, [userEmail, filterType, searchQuery, currentPage]);

  const fetchFiles = async () => {
    if (!userEmail) return;

    setLoading(true);
    try {
      let apiUrl = `${import.meta.env.VITE_HOST_SERVER_ADDRESS}/api/files?user_email=${encodeURIComponent(userEmail)}`;

      // Add filters
      if (filterType !== 'all') {
        apiUrl += `&type=${filterType}`;
      }

      if (searchQuery) {
        apiUrl += `&search=${encodeURIComponent(searchQuery)}`;
      }

      // Add pagination
      apiUrl += `&page=${currentPage}&limit=12`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setTotalFileSizeUploadLimit(data.totalFileSizeUploadLimit);
      setTotalUploadedFileSize(data.totalUploadedFileSize)

      // Transform the API response to match your frontend structure
      const transformedFiles = data.files.map(file => ({
        id: file._id,
        name: file.name,
        type: getFileTypeFromName(file.name),
        description: file.description,
        tags: file.tags || [],
        size: formatFileSize(file.final_size || file.original_size),
        uploadDate: new Date(file.uploaded_at).toLocaleDateString(),
        uploadTime: new Date(file.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        url: file.url,
        uploaded_at: file.uploaded_at
      }));

      setFiles(transformedFiles);
      setTotalPages(data.totalPages || 1);
      setTotalFiles(data.total || 0);
      setTotalUploadedFile(data.total);
    } catch (error) {
      console.error('Error fetching files:', error);
      alert('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeFromName = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();

    // Image types
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return 'image';
    }

    // PDF
    if (extension === 'pdf') {
      return 'pdf';
    }

    // Document types
    if (['doc', 'docx', 'rtf', 'odt'].includes(extension)) {
      return 'document';
    }

    //Text type
    if (['txt', 'csv'].includes(extension)) {
      return 'text';
    }

    return null;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const logout = async () => {
    await signOut(auth);
    setUserEmail(null);
    setUserName(null);
    setUserImage(null);
    navigate("/login");
  }

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return (
          <div>
            <img src={pdfFileIcon} style={{ height: "40px", width: "40px" }} alt="PDF" />
          </div>
        );
      case 'image':
        return (
          <div>
            <img src={imageFileIcon} style={{ height: "40px", width: "40px" }} alt="Image" />
          </div>
        );
      case 'document':
        return (
          <div>
            <img src={wordFileIcon} style={{ height: "40px", width: "40px" }} alt="Image" />
          </div>
        );
      case 'text':
        return (
          <div>
            <img src={textFileIcon} style={{ height: "40px", width: "40px" }} alt="Image" />
          </div>
        );
      default:
        return (
          <div>
            <img src={fileIcon} style={{ height: "40px", width: "40px" }} alt="File" />
          </div>
        );
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileName = selectedFile.name;
      const fileSize = selectedFile.size;
      const fileType = getFileTypeFromName(fileName);

      setNewFile({
        ...newFile,
        name: fileName,
        type: fileType,
        size: formatFileSize(fileSize),
        file: selectedFile
      });
    }
  };

  const handleUpload = async () => {
    if (!newFile.file || !newFile.description) {
      alert('Please select a file and add a description.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', newFile.file);
      formData.append('name', newFile.name);
      formData.append('type', newFile.type);
      formData.append('description', newFile.description);
      formData.append('tags', newFile.tags);
      formData.append('user_email', userEmail);

      const response = await fetch(`${import.meta.env.VITE_HOST_SERVER_ADDRESS}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        console.error(err);
        alert('Upload failed');
        return;
      }

      const result = await response.json();
      console.log(result);

      // Refresh the files list
      fetchFiles();

      // Reset form and close modal
      setShowUploadModal(false);
      setNewFile({ name: '', type: '', description: '', tags: '', size: '', file: null });

      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_HOST_SERVER_ADDRESS}/api/files?id=${fileId}&user_email=${userEmail}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        // ✅ remove from UI immediately
        setFiles(prev => prev.filter(f => f._id !== fileId));

        // ✅ optional: sync with backend pagination
        fetchFiles();

        alert("File deleted successfully!");
      } else {
        let message = "Please try again.";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch { }

        alert(`Delete failed: ${message}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Delete failed. Please check your connection and try again.");
    }
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
    setPageNumber(1);
    setNumPages(null);

    // Prepare docs for DocViewer
    if (['document', 'text'].includes(file.type)) {
      setDocViewerDocs([{ uri: file.url, fileName: file.name }]);
    }

    setShowViewModal(true);
  };

  const handleDownload = async (file) => {
    if (!file || typeof file.url !== "string") {
      alert("Download URL not available");
      return;
    }

    try {
      const response = await fetch(file.url, { mode: "cors" });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = file.name || "download";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Unable to download file");
    }
  };


  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile) return null;

    switch (selectedFile.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={selectedFile.url}
              alt={selectedFile.name}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        );

      case 'pdf':
        return (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(
              selectedFile.url
            )}&embedded=true`}
            className="w-full h-full rounded-lg"
          />
        );

      case 'document':
        return (
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(
              selectedFile.url
            )}&embedded=true`}
            className="w-full h-full rounded-lg"
            title="Document Viewer"
          />
        );

      case 'text':
        return (
          <TextPreview url={selectedFile.url} />
        );

      default:
        return (
          <div className={`text-center py-12 h-full flex flex-col items-center justify-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <FileText className={`w-24 h-24 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mb-4`} />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Preview not available for this file type</p>
            <button
              onClick={() => handleDownload(selectedFile)}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download File
            </button>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* LEFT SECTION */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpenDrawer(true)}
                className={`sm:hidden p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
              >
                <svg width="22" height="22" fill="none" stroke="currentColor">
                  <path strokeWidth="2" d="M3 6h16M3 12h16M3 18h16" />
                </svg>
              </button>

              <img src={icon} className="h-10 w-10" alt="CloudStore" />

              <div>
                <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  CloudVault
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>File Management</p>
              </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Upload File
              </button>

              <button
                onClick={logout}
                className={`
                  hidden sm:flex items-center
                  px-4 py-2.5 rounded-lg
                  ${isDarkMode ?
                    'border-red-700 text-red-400 hover:bg-red-900/30 hover:border-red-600' :
                    'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300'
                  }
                  border text-sm font-medium transition
                `}
              >
                Logout
              </button>

              <img
                src={userImage || defaultAvatar}
                alt="Profile"
                onClick={() => navigate("/profile")}
                className="h-9 w-9 rounded-full object-cover border cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* LEFT DRAWER */}
        {openDrawer && (
          <div className="fixed inset-0 z-50 flex">
            <div className={`w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-xl`}>
              <div className="flex items-center justify-between mb-6">
                <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Menu</span>
                <button
                  onClick={() => setOpenDrawer(false)}
                  className={isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                >
                  ✕
                </button>
              </div>

              <button
                onClick={() => {
                  setShowUploadModal(true);
                  setOpenDrawer(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                <Plus className="w-4 h-4" />
                Upload File
              </button>

              <button
                onClick={logout}
                className={`
                  mt-3 w-full flex items-center justify-center gap-2
                  px-4 py-2 rounded-lg
                  ${isDarkMode ?
                    'bg-red-900/30 text-red-400 hover:bg-red-800/40 hover:text-red-300' :
                    'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
                  }
                  transition-all duration-200
                  border ${isDarkMode ? 'border-red-800' : 'border-red-200'}
                  font-medium
                `}
              >
                <span>Logout</span>
              </button>
            </div>

            <div
              className="flex-1 bg-black/40"
              onClick={() => setOpenDrawer(false)}
            />
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className={`mb-8 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-4`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search files by name or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full pl-10 pr-4 py-2.5 border ${isDarkMode ?
                  'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                  'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                  } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'image', 'pdf', 'document', 'text'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-sm rounded-lg font-medium capitalize transition-all ${filterType === type
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
          {/* Total Files */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-3 md:p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Total Files</p>
                <p className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{totalFiles}</p>
              </div>
              <img src={folderIcon} className="w-6 h-6 md:w-8 md:h-8" alt="Files" />
            </div>
          </div>

          {/* Images */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-3 md:p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Images</p>
                <p className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {files.filter(f => f.type === 'image').length}
                </p>
              </div>
              <img src={imageFileIcon} className="w-6 h-6 md:w-8 md:h-8" alt="Images" />
            </div>
          </div>

          {/* PDFs */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-3 md:p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>PDFs</p>
                <p className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {files.filter(f => f.type === 'pdf').length}
                </p>
              </div>
              <img src={pdfFileIcon} className="w-6 h-6 md:w-8 md:h-8" alt="pdf" />
            </div>
          </div>

          {/* Documents */}
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-3 md:p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Documents</p>
                <p className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {files.filter(f => f.type === 'document').length}
                </p>
              </div>
              <img src={wordFileIcon} className="w-6 h-6 md:w-8 md:h-8" alt="docx" />
            </div>
          </div>

          {/* Text Files - Spans 2 columns on mobile only */}
          <div className={`col-span-2 md:col-span-1 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-3 md:p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Text Files</p>
                <p className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {files.filter(f => !['image', 'pdf', 'document'].includes(f.type)).length}
                </p>
              </div>
              <img src={textFileIcon} className="w-6 h-6 md:w-8 md:h-8" alt="txt" />
            </div>
          </div>
        </div>




        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-4`}>Loading files...</p>
          </div>
        ) : (
          <>
            {/* Files Grid */}
            {filteredFiles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 overflow-hidden group`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg flex items-center justify-center group-hover:${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} transition-colors`}>
                            {getFileIcon(file.type)}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewFile(file)}
                              className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'} rounded-lg transition-all`}
                              title="View file"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDownload(file)}
                              className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'} rounded-lg transition-all`}
                              title="Download file"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'} rounded-lg transition-all`}
                              title="Delete file"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 truncate`} title={file.name}>
                          {file.name}
                        </h3>

                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-2`}>
                          {file.description}
                        </p>

                        {file.tags && file.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {file.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className={`flex items-center justify-between pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                          <div className={`flex items-center space-x-4 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{file.uploadDate}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{file.uploadTime}</span>
                            </div>
                          </div>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{file.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center items-center space-x-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg ${currentPage === 1
                        ? isDarkMode
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      Previous
                    </button>
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg ${currentPage === totalPages
                        ? isDarkMode
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={`text-center py-16 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border`}>
                <File className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-lg`}>No files found</p>
                <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-2`}>
                  {files.length === 0
                    ? 'Upload your first file to get started'
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload New File</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setNewFile({ name: '', type: '', description: '', tags: '', size: '', file: null });
                }}
                className={`p-2 ${isDarkMode ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} rounded-lg transition-all`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Select File *
                </label>
                <input
                  type="file"
                  id="file-upload"
                  required
                  onChange={handleFileSelect}
                  className={`w-full px-4 py-2.5 border ${isDarkMode ?
                    'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 file:bg-gray-600 file:text-gray-200' :
                    'border-gray-300 bg-white text-gray-900 focus:ring-blue-500 file:bg-blue-50 file:text-blue-700'
                    } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold hover:file:${isDarkMode ? 'bg-gray-500' : 'bg-blue-100'} cursor-pointer`}
                />
                {newFile.file && (
                  <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'} mt-2 flex items-center`}>
                    <span className="mr-1">✓</span> {newFile.file.name} selected
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  File Description *
                </label>
                <textarea
                  required
                  value={newFile.description}
                  onChange={(e) => setNewFile({ ...newFile, description: e.target.value })}
                  placeholder="Add notes or description about this file..."
                  rows="3"
                  className={`w-full px-4 py-2.5 border ${isDarkMode ?
                    'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                    'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                    } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all resize-none`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newFile.tags}
                  onChange={(e) => setNewFile({ ...newFile, tags: e.target.value })}
                  placeholder="e.g., work, important, client"
                  className={`w-full px-4 py-2.5 border ${isDarkMode ?
                    'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500' :
                    'border-gray-300 bg-white text-gray-900 focus:ring-blue-500'
                    } rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all`}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setNewFile({ name: '', type: '', description: '', tags: '', size: '', file: null });
                  }}
                  className={`flex-1 px-4 py-2.5 border ${isDarkMode ?
                    'border-gray-600 text-gray-300 hover:bg-gray-700' :
                    'border-gray-300 text-gray-700 hover:bg-gray-50'
                    } rounded-lg font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
          {/* Main Modal Container */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} w-full max-w-6xl flex flex-col h-full max-h-screen md:max-h-[90dvh] overflow-hidden`}>
            {/* Header - Fixed height */}
            <div className={`flex items-center justify-between p-4 md:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} shrink-0`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center shrink-0`}>
                  {getFileIcon(selectedFile.type)}
                </div>
                <div className="min-w-0">
                  <h2 className={`text-base md:text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                    {selectedFile.name}
                  </h2>
                  <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase`}>{selectedFile.type} • {selectedFile.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="p-2 md:px-4 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Download</span>
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className={`p-2 ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'} rounded-lg`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body Area */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
              {/* Left: Preview Area */}
              <div className={`w-full lg:flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 md:p-6 min-h-[50vh] lg:min-h-0 flex-shrink-0 lg:flex-shrink`}>
                <div className="h-full w-full flex items-center justify-center">
                  {renderFilePreview()}
                </div>
              </div>

              {/* Right: Sidebar Info */}
              <div className={`w-full lg:w-96 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} border-t lg:border-t-0 lg:border-l ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="p-4 md:p-6">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>File Details</h3>
                  <div className="space-y-6">
                    {/* Description */}
                    <section>
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Description</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-lg leading-relaxed`}>
                        {selectedFile.description || "No description provided"}
                      </p>
                    </section>

                    {/* Tags */}
                    {selectedFile.tags && (
                      <section>
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedFile.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Meta Data Grid */}
                    <section className="space-y-2 pb-6 lg:pb-0">
                      <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Metadata</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className={`flex justify-between p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-sm`}>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Size</span>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{selectedFile.size}</span>
                        </div>
                        <div className={`flex justify-between p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg text-sm`}>
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Uploaded</span>
                          <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{selectedFile.uploadDate}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}