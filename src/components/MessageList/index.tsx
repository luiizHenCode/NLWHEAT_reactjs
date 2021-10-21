import { useEffect, useState } from "react";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import io from "socket.io-client";

import styles from "./styles.module.scss";

import logoImage from "../../assets/logo.svg";

import { api } from "../../services/api";

type Message = {
  id: string;
  text: string;
  user: {
    name: string;
    avatar_url: string;
  };
};

const messagesQueue: Message[] = [];

const socket = io("http://localhost:4000");

socket.on("new_message", (newMessage) => {
  messagesQueue.push(newMessage);
});

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setMessages((state) =>
          [messagesQueue[0], state[0], state[1]].filter(Boolean)
        );
      }
      messagesQueue.shift();
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.get<Message[]>("/messages/last3").then((response) => {
      setMessages(response.data);
    });
  }, []);

  return (
    <div className={styles.messageListWrapper}>
      <img src={logoImage} alt="DoWhile2021" />

      <AnimatePresence>
        <AnimateSharedLayout type="switch">
          <ul className={styles.messageList}>
            {messages.map((message) => (
              <motion.li
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                layout="position"
                layoutId={`message-${message.id}`}
                className={styles.message}
                key={message.id}
              >
                <p className={styles.messageContent}>{message.text}</p>

                <div className={styles.messageUser}>
                  <div className={styles.userImage}>
                    <img
                      src={message.user.avatar_url}
                      alt={message.user.name}
                    />
                  </div>
                  <span>{message.user.name}</span>
                </div>
              </motion.li>
            ))}
          </ul>
        </AnimateSharedLayout>
      </AnimatePresence>
    </div>
  );
}
