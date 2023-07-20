import ReactQuill from "react-quill";
import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "react-quill/dist/quill.snow.css";
import { BsFileEarmarkArrowUp } from "react-icons/bs";
import { FaFileUpload } from "react-icons/fa";

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const fileUrl = URL.createObjectURL(file);
    const modifiedFile = { ...file, url: fileUrl, name: file.name };
    setSelectedFile(modifiedFile);
    console.log("Uploading file:", file);
  };

  const modules = {
    toolbar: [
      ["bold", "italic", "strike"],
      ["link", "blockquote", "code-block"],
      [{ list: "bullet" }, { list: "ordered" }],
      ["code"],
    ],
  };

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        file: selectedFile,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setSelectedFile(null);
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent) => {
            return (
              <div
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: messageContent.message,
                      }}
                    />
                    {messageContent.file && (
                      <div className="file-attachment">
                        <a
                          href={messageContent.file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {messageContent.file.name}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <div className="editor-container">
          <ReactQuill
            className="editor-input"
            theme="snow"
            placeholder="Enter your text here..."
            value={currentMessage}
            onChange={setCurrentMessage}
            modules={modules}
          />
        </div>
        <label htmlFor="file-upload" className="upload-icon">
          <input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <FaFileUpload />
        </label>
        <div className="button-container">
          <button className="send-button" onClick={sendMessage}>
            &#9658;
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
