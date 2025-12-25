import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import useStore from "../store";
import { useEffect } from "react";

export default function AuthWatcher({ children }) {
  const { setUserEmail, setUserName, setUserImage } = useStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserName(user.displayName);
        setUserImage(user.photoURL);
      } else {
        setUserEmail(null);
        setUserName(null);
        setUserImage(null);
      }
    });

    return () => unsub();
  }, []);

  return children;
}
