import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { postData } from '../../../mocks/CallingAPI.ts';

export default function ChatBox() {
    const [Messages, setMessages] = useState<string[]>([]);
    const [WidthFull, setWidthFull] = useState<boolean>(false);
    const [HeightFull, setHeightFull] = useState<boolean>(false);
    const [DisplayChat, setDisplayChat] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setMessages([
            'Xin chào! Tôi là trợ lý AI của bạn. Hãy đặt câu hỏi để tôi hỗ trợ nhé!',
        ]);
    }, []);

    const addMessage = async (newMessage: string): Promise<void> => {
        console.log('newMessage: ', newMessage);
        const SendMessage = { message: newMessage };
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        try {
            const result = await postData<{ reply: string }>('Chat/ask', SendMessage, token);
            console.log('result', result);
            // if (
            //     result.reply?.includes(
            //         'The model is overloaded. Please try again later.'
            //     )
            // ) {
            //     setMessages((prev) => [
            //         ...prev,
            //         'Kết nối không ổn định, bạn hãy thử lại sau nhé!',
            //     ]);
            // } else {
            //     setMessages((prev) => [...prev, result.reply]);
            // }
            setMessages((prev) => [
                ...prev,
                "Trieu's note: Vào src/app/components/ChatBox dòng 19 -> 55 gắn lại api chat với AI nha!",
            ]);
        } catch (error) {
            // setMessages((prev) => [
            //     ...prev,
            //     'Kết nối không ổn định, bạn hãy thử lại sau nhé!',
            // ]);
            setMessages((prev) => [
                ...prev,
                "Trieu's note: Vào đường dẫn src/app/components/ChatBox dòng 19 -> 55 gắn lại api chat với AI nha!",
            ]);
        } finally {
            setLoading(false);
        }
    };

    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop =
                chatContainerRef.current.scrollHeight;
        }
    }, [Messages]);

    const addMyMessage = (newMessage: string): void => {
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleSend = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.chat as HTMLInputElement;

        if (input.value && !loading) {
            addMyMessage(input.value);
            addMessage(input.value);
            input.value = '';
        }
    };

    const StyleNormal: React.CSSProperties = {
        width: '320px',
        height: '420px',
    };
    const StyleHeight: React.CSSProperties = {
        width: '320px',
        height: '80vh',
    };
    const StyleFull: React.CSSProperties = {
        width: 'calc(100vw - 40px)',
        height: '80vh',
        maxWidth: '1000px',
    };

    let chatStyle: React.CSSProperties = StyleNormal;
    if (WidthFull) {
        chatStyle = StyleFull;
    } else if (HeightFull) {
        chatStyle = StyleHeight;
    }

    const renderFormattedText = (text: string) => {
        const lines = text.split(/(?<=\s)\*(?=\s)/);

        return lines.map((line, idx) => {
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
                <div key={idx}>
                    {parts.map((part, i) =>
                        part.startsWith('**') && part.endsWith('**') ? (
                            <strong key={i}>{part.slice(2, -2)}</strong>
                        ) : (
                            <span key={i}>{part}</span>
                        )
                    )}
                </div>
            );
        });
    };

    return (
        <div className="chat-box-container">
            {!DisplayChat && (
                <div className="open-icon" onClick={() => setDisplayChat(true)}>
                    ChargeX
                </div>
            )}
            {DisplayChat && (
                <div className="chat-box" style={chatStyle}>
                    <div className="heading">
                        <div className="name">
                            <span>ChargeX AI</span>
                        </div>
                        <div>
                            {WidthFull ? (
                                <i
                                    className="fa-solid fa-compress-arrows-alt"
                                    onClick={() => setWidthFull(false)}
                                    title="Thu nhỏ"
                                ></i>
                            ) : (
                                <i
                                    className="fa-solid fa-arrows-alt"
                                    onClick={() => setWidthFull(true)}
                                    title="Mở rộng"
                                ></i>
                            )}
                            {HeightFull ? (
                                <i
                                    className="fa-solid fa-arrows-alt-v fa-rotate-90"
                                    onClick={() => setHeightFull(false)}
                                    title="Thu nhỏ chiều cao"
                                ></i>
                            ) : (
                                <i
                                    className="fa-solid fa-arrows-alt-v"
                                    onClick={() => setHeightFull(true)}
                                    title="Mở rộng chiều cao"
                                ></i>
                            )}
                            <i
                                className="fa-solid fa-times"
                                onClick={() => setDisplayChat(false)}
                                title="Đóng"
                            ></i>
                        </div>
                    </div>
                    <div ref={chatContainerRef} className="chat-content">
                        <div className="welcome-message">
                            <i className="fa-solid fa-comments welcome-icon"></i>
                            <div className="welcome-text">
                                <h3>Chào mừng bạn đến với ChargeX AI!</h3>
                                <p>
                                    Hãy bắt đầu cuộc trò chuyện bằng cách nhập
                                    tin nhắn bên dưới.
                                </p>
                            </div>
                        </div>
                        {Messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`message ${
                                    idx % 2 === 0
                                        ? 'bot-message'
                                        : 'user-message'
                                }`}
                            >
                                <div>{renderFormattedText(msg)}</div>
                                <div className="logo-bot">X</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="typing-indicator">
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="dot"></div>
                                <div className="logo-bot">X</div>
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSend}>
                        <div className="form-group">
                            <i className="fa-solid fa-comment-dots input-icon"></i>
                            <input
                                type="text"
                                id="chat"
                                name="chat"
                                placeholder="Nhập tin nhắn của bạn..."
                                disabled={loading}
                            />
                        </div>
                        <button
                            className="btn"
                            type="submit"
                            disabled={loading}
                            title="Gửi tin nhắn"
                        >
                            {loading ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fa-solid fa-paper-plane"></i>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
