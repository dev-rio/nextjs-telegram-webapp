"use client";
import axios from "axios";
import { useEffect, useState } from "react";

interface WebAppUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export default function HomePage() {
  const [isHashValid, setIsHashValid] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<WebAppUser | null>(null);

  useEffect(() => {
    const validateHash = async () => {
      try {
        const response = await axios.post("/api/validate-hash", {
          hash: window.Telegram.WebApp.initData
        });
        setIsHashValid(response.status === 200);
      } catch (error) {
        console.error("Failed to validate hash:", error);
        setIsHashValid(false);
      }
    };

    validateHash();

    const initTelegram = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        const user = window.Telegram.WebApp.initDataUnsafe?.user;
        if (user) {
          setUserData(user as WebAppUser);
        }
      }
    };

    if (document.readyState === "complete") {
      initTelegram();
    } else {
      window.addEventListener("load", initTelegram);
      return () => window.removeEventListener("load", initTelegram);
    }
  }, []);

  if (isHashValid === null) {
    return <div>Loading...</div>;
  }

  if (!isHashValid) {
    return <div>Invalid hash</div>;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div>
        Information: <br />
        first name: {userData?.first_name}
        <br />
        user id: {userData?.id}
      </div>
    </main>
  );
}
