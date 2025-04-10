"use client";

import { Message } from "ai";
import { useChat, useFormStatus } from "ai/react";
import { useEffect, useState } from "react";
import { Files } from "@/components/files";
import { AnimatePresence, motion } from "framer-motion";
import { FileIcon, LoaderIcon } from "@/components/icons";
import { Message as PreviewMessage } from "@/components/message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Session } from "next-auth";

const suggestedActions = [
    {
        title: "What's the summary",
        label: "of these documents?",
        action: "what's the summary of these documents?",
    },
    {
        title: "Who is the author",
        label: "of these documents?",
        action: "who is the author of these documents?",
    },
];

export function Chat({
    id,
    initialMessages,
    session,
}: {
    id: string;
    initialMessages: Array<Message>;
    session: Session | null;
}) {
    const [selectedFilePathnames, setSelectedFilePathnames] = useState<
        Array<string>
    >([]);
    const [isFilesVisible, setIsFilesVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        if (isMounted !== false && session && session.user) {
            localStorage.setItem(
                `${session.user.email}/selected-file-pathnames`,
                JSON.stringify(selectedFilePathnames)
            );
        }
    }, [selectedFilePathnames, isMounted, session]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (session && session.user) {
            setSelectedFilePathnames(
                JSON.parse(
                    localStorage.getItem(
                        `${session.user.email}/selected-file-pathnames`
                    ) || "[]"
                )
            );
        }
    }, [session]);

    const { messages, handleSubmit, input, setInput, append, pending } = useChat({
        body: { id, selectedFilePathnames },
        initialMessages,
        onFinish: () => {
            window.history.replaceState({}, "", `/${id}`);
        },
    });

    const [messagesContainerRef, messagesEndRef] =
        useScrollToBottom<HTMLDivElement>();

   const brainIconSVG = `<svg id="etQIPxpsoGF1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" project-id="17d49da1056e46458250dc7892a127e3" export-id="89162d3c1a0e481280c0b08b7840c121" cached="false"><image width="64" height="64" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAADH5JREFUeF7FW31wFkcZf/bgX+s44zgDg39oywhWVKpoGT5yS4GG8tEUqCYU5LvyWYEGTCDhvWsCAYmCBgqlfKQGTJimEEpoQgHfTQFrB21tmY4oVmccLDrjOFP/Fe7x3b3d+757796k4f55Z3PP7T77298+X7shUOLzybINBgHIIQIQ4nbSnzbvx7Ky9wcEzM8e22eUMhWP6tk+/++yDZjti3TSXKHMHRNgDxzdR9ON4JfqFwAlKZtBy9T9I7AHjt8HAJLnklr9DJBEixIC7DP3gwFcHU5XL43SthU8aeXV1CPl7wcDPlm6AYX1U1avyC8iF4+TV0im7887LoH7sAX+s2RjhK0Krk8p7JZuJYMl5AB8rnXv4BrBfy/exDX1bAI1+YH9JYCAUeM4/laMxz7/yk8HF4B/LXo+fo2QmBYAGwoAdwHA/b0Ld2Gopx18H9+2NNABMRfFKc6AL7QNMgB3FlYHAHCt/rATzSW717hNc2dhtQ4A+ej3yIadGGQAbi/YnLxLERloPLRDAA0ALAB/m/9dS3gfkEfCAfA9DuQE2YiTzYO7Bf5etQWDnn4w2sr18l/XAhH2xfbdgwvA376/5dM1gn4jJ4yt62NCxpd96dQgA/DR92pcBkh9lJtXPB04Rtg9xfXHI8Evn9o1uAz48/wa5IGNHeCoeCim7cQ5CfKC0in7C44HwEZ2DgIAf5q/1bBAY6M7G9nNeVvRmbgGgDKNLRoYcjkur+KdUn4D4wFBNqqziXL9OPu+0rkzdWqc2l19OHeryP+JpdHRXY3sw6dcABzKy5UZ7DYBZF8900S5jgVTkQNimQ+f3pUKhNQA3KjYJikPdExXIxNtTllumiQV1JYAIEKmlEA47psbFXVGYcfl+JaLGI+N6WqkXKbArRx/P+ZMY6q5pRJ6r6JOJwh5LmwRoGO7GtkfnqxzjGDIJhMQkeBAAqBZoCMBEQkGxwMA9s2zjfT9ijoDEXJePYvpkA6AOdsNBMzxFQfLomO7G9m7c+odBigmiPd2xCMjeBXJp/xVRlUwywIiIijb+dkZQcwvAht7roG+59UTwBz7+gtFt0EqAK7P2s47EsgiaHRct8Guz9o+cIGQcqOBcpizxeQyxrtVZOO6G6jS0xa39RwQBrwzyzB4IsIVuEcIHd9tsHdm5jIBwNdRradSSkXI/Y0beBzwnW6T2npaObFJCDG/2230jwFvP2EYKCbOqScrPwh0fK/BfjPDkAAoako/LqjryrvUVXvXK2/Hd6XK28CJ79n4HoNG6gvIAInJdY7JJMN/vlJu6BoQkXkFSxwWIJ3Ua7Br5aZIhnzvVYCSwDs1YSWStSSmJq0KcXZGRtjE3u30Wrnp2io5gOpf6R1ULdIGvDXd5M4mstxBNBuAvulmvBdIVSYJrnza8opdWhPe0I0w2eQL22nfdNNjq8L9lb0pdrHvCf0hP900CGo5F4CAogiUXqpn+WkNEVvAR2lGNFLYkpH1HIc5GetHelje3gL6xXqan95ggIU5AZCzgK7+/ACFvlnvswshAC4/1iDz/Oj6Ho8Dpl2qZ65cmO9KppgFzvo+bkwEYFMv19PLUxvsSNB5/HNAAmzqpXpf0hQC4OKURp7e2KVuwTFPJ7xNLAHAxSk75NIG3tvc5Ianz9bDjgvcp/Q2D4RIUB853rTLdfTilB12JKg2h5OeymkSgGmXt/nmHAKgR98hqG3bFpm0+NoWncHqWa9uA6D2YrR8IXwS4ZJrUBKNZkx/jvuMHY+wcraV9ugcADteidO/PF8EgDcmNeVhCOr2JnLTU1XSIgB0BqtlPWU7kaeDFqKodIXkg99zWMUE7PRZbVJ/3cMznggcpA0p2j9hT7Bael5vsuOVeHkh5916IQacm9wkULSFIuyABXT21Vp2bnJThsp91t2eUR6Bzb5SS23d1RaI6EMDOpvV+uKBSDd4lneExDEmXhgsRPrU1VrWNWmXu1XUWNF204NjMJjNONEIcbkKrOJKDQ3q7RNHNJ+8WhuKDCMBOD1hV74QXIgqbDBwIcQSAJyesFsGQgiajPyi5MOBj2NiJccGog1s7rUa+trE3TJkd6fljo9CJohhCICOsmae9jol6FAkSJBWsc3sVFlzOBLsx2FpHIl84yOANCXOPBQDKvuq6Sl9j4GSuWpi3u8RkFX2bY63AW1T9zr5tF8ht5u7BOjSSxtZ22N74wEgYDoaJng9kQyl9YoIZYW83wmEAoCxRZc30rD+Qf6JFTIX/XqjsxV8DDhW3pJHRN0+xVVuUJ3q2m3uBZb2rmfHHm+RbtB+T+TqcCu//MJzqdLsLBbgeHkLnzzXT54y+/Rjy3rX06PlLdILxOsPCGzZhfUOC3yKHpp5QIQZHjfqu64iTBix6Oru9ezgzAMJ6TApmodnmbz0SLovLvMdIhO2+vwaenDWAV8kGDS5qr36/FpvqOCq0lJxOF/YJ6EjKL/ftOj6rtXsFxUvJbtBzhbOisiZxrkLN4HJAhAviq7vWkVbKl4yCkPGu3BbG/Zc16poBuyZ/7JBRFXVpZBbv5aUA6SbO1ey5nlH3FA4KC/OBD2hdEJ/wf59bWEk+FKrOroMzcP9serOFTSN/oDIql9bGQ0Ah6ep8njiyg4FoJs7lrKwXPyqxr4ZkLBA9M5qO5bSpsrjniAukkNCzs/ogJyxsE3n0ZTjCgMX//AuoUbHImYu/KUNVH8uBg7Q90gIM078gJoLX5HnAh7TJvXjGSOXKRoHcIG6JSclklFm5B5tbF3E6pac9JQk/GbT/SrODClOxL1PNMMRZpqwxtYFtG7ZSQMsaQNsi61OLvg3ZmPrM8UjwZoV7boly2FRJNIA6a4jVWzLio6Sc4EBYb5HOb66e45U0i0r2o2C6Y28RSI9ifmTI1XJBZENq17NE+JeRggzHM19h542Nq7utAOhUq/KOnFGmquxLmRR43HLvu/QfLppzauGZRE7G5SPV54QNH/24tPJAKxZd7pIrQ/NF/fPM9atO8PdpW6B5V4AAQ1U274bFN+2A0D3va/NL45YCe+dMov7/f7984y1684IN+7Jtt3SmHTLB/bP9cU+oYht5cbXHWrH7mAk9Mi+2Z9CsJPF+/tln910VmSw3Dere2Uh/RHg8L45yQAsrj7vHnuH7i3KCo9d2GCRSEdWkz3fOTdLSV9r80xBxyXV53QEIk+e4s4PkqrGxM4Rit2zBGStzbOS3eCCrT2eWkD/rbQ8P5bL5emPEPNXOx8XACys6dEtws8hPDPwnAVGHoeKHjPq5xnT62dCvJtff9Fj4eMDnNIJK3Q3O1+YJgCYX3dRBxJ3BU6YWv+N5BJV6myYFtrykVlbhZlPiKmDoxdp+8y2wlVkj2aXQQUAFUaeH33LO4BR/anVjgAj5XVtgkC7DBqyW7Fpa3lDXidDhuQKsXNichRiQczqBP9cMMrmG9vKBADlDVd0olmRR3G+/kNgpsi6kbBC9dbsrZ+U/mzQO+jUpis6aJpOCAoLmxJwjyOOuU+PYF768QQBwNQ9V3RAzWZARoLFynv6T9qqKSAEmLjnbV3TOEWlixF1KVtTT80ta9t86/nxAoCJe67rmnY3W/9OjK9qil59RBrp9N9vAB79+XWjMNeAm0p7mBkjh2D+9kfjBACPtlzn5xDiCo4igO/XcyAS+T7qO0///QbgkQO/N4CQnLoBYx8+xpcDUqX/iOa7a78lAPj2wRu6hf+zAQj+u4CnHXyf1CaE0N+tHls0WEu1BbiSYw6/794J8t3lcdfEuTgJpJCUqXK55724O2RfoCicmZkf/PAbAoCvvXxDJ2jl4+4AKQ5lef/Bs19PNbdUQlzJUUdvGMhZkPpJzvkIonlz+RgBwKjjN3RE+0JGvx9unixi3lz+cNHrMV7nmmrcB9tu5hHdM4PYj9Lku4jmXxePFko+1PZH3fIB4O8gTXeOLp5+00wqNQNUZyNO3hIGMcZcxdzz8po32RMBertqpNijI9pv8f8GsUPhUq9O8O+QmLefGZlq5dV8MgPgANF+S7c0Tdcsi/GJDG//yAAS9S8t0eunIToA8D6Hd/zFDb+LLDn/F5l/VD5EBXDyUWCmWXWvTMkABAca3s6ZQXjkWLTCwW9q3Kkc6cvKfN/zqrKCw+lPooLcjAL9p2RP1gkH5QcMALGKsSzwDxtcffXWx4K4mSGaH1dlo3kSSAMKAB9oWMct7s7i84eECXBK3xMBV8z3Azz5zF4gLd34RLjLLBQrBRB8zyKSvo+rHkxloDiTCMGyUr9PqyeX+z/raqSqgyaioAAAAABJRU5ErkJggg==" preserveAspectRatio="xMidYMid meet"/><polygon points="0,-6.4 1.880913,-2.588854 6.086762,-1.977709 3.043381,0.988854 3.761826,5.177709 0,3.2 -3.761826,5.177709 -3.043381,0.988854 -6.086762,-1.977709 -1.880913,-2.588854 0,-6.4" transform="translate(44.218182 11.636364)" fill="#d2dbed" stroke-width="0"/><polygon points="0,-6.4 1.880913,-2.588854 6.086762,-1.977709 3.043381,0.988854 3.761826,5.177709 0,3.2 -3.761826,5.177709 -3.043381,0.988854 -6.086762,-1.977709 -1.880913,-2.588854 0,-6.4" transform="translate(22.109091 11.025219)" fill="#d2dbed" stroke-width="0"/><polygon points="0,-6.4 1.880913,-2.588854 6.086762,-1.977709 3.043381,0.988854 3.761826,5.177709 0,3.2 -3.761826,5.177709 -3.043381,0.988854 -6.086762,-1.977709 -1.880913,-2.588854 0,-6.4" transform="translate(32 0)" fill="#d2dbed" stroke-width="0"/></svg>`;

    return (
        <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
            <div className="flex flex-col justify-between items-center gap-4">
                <div
                    ref={messagesContainerRef}
                    className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
                >
                    {messages.map((message, index) => (
                        <PreviewMessage
                            key={`${id}-${index}`}
                            role={message.role}
                            content={message.content}
                        />
                    ))}
                    <div
                        ref={messagesEndRef}
                        className="flex-shrink-0 min-w-[24px] min-h-[24px]"
                    />
                </div>

                {messages.length === 0 && (
                    <div className="grid sm:grid-cols-2 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[500px]">
                        {suggestedActions.map((suggestedAction, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * index }}
                                key={index}
                                className={index > 1 ? "hidden sm:block" : "block"}
                            >
                                <button
                                    onClick={async () => {
                                        append({
                                            role: "user",
                                            content: suggestedAction.action,
                                        });
                                    }}
                                    className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                                >
                                    <span className="font-medium">{suggestedAction.title}</span>
                                    <span className="text-zinc-500 dark:text-zinc-400">
                                        {suggestedAction.label}
                                    </span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                 <form
                    className="flex flex-row gap-2 relative items-center w-full md:max-w-[500px] max-w-[calc(100dvw-32px)] px-4 md:px-0 bg-zinc-100 rounded-full shadow-md p-2 dark:bg-zinc-800"
                    onSubmit={handleSubmit}
                >
                    <div className="flex items-center">
                        <button
                            type="button"
                            className="flex items-center p-1 rounded-full text-zinc-500 hover:text-zinc-400 focus:outline-none"
                            onClick={() => {
                                setIsFilesVisible(!isFilesVisible);
                            }}
                         >
                          <div className="h-5 w-5" dangerouslySetInnerHTML={{ __html: brainIconSVG }} />

                            <motion.span
                                className="ml-1 text-xs bg-blue-500 size-4 rounded-full flex flex-row justify-center items-center border-2 border-white text-blue-50"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                {selectedFilePathnames?.length}
                            </motion.span>
                        </button>
                    </div>
                  
                        <textarea
                            className="bg-transparent rounded-md px-2 py-1.5 flex-1 outline-none text-zinc-700 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(event) => {
                                setInput(event.target.value);
                            }}
                            disabled={pending}
                        />
                       <div className="flex items-center">
                            <button
                                type="submit"
                                className="p-2 rounded-full text-zinc-500 hover:text-zinc-400 focus:outline-none disabled:text-zinc-300"
                                disabled={pending}
                            >
                                {pending ? (
                                    <span className="animate-spin">
                                        <LoaderIcon />
                                    </span>
                                ) : (
                                    <svg  width="20" height="20"  viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.375 8.59167H15.625L11.5625 4.53333L10.4167 5.67917L13.2917 8.55417L10.4167 11.4292L11.5625 12.575L15.625 8.51667H4.375V8.59167Z" fill="currentColor"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                </form>
            </div>

            <AnimatePresence>
                {isFilesVisible && (
                    <Files
                        setIsFilesVisible={setIsFilesVisible}
                        selectedFilePathnames={selectedFilePathnames}
                        setSelectedFilePathnames={setSelectedFilePathnames}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
