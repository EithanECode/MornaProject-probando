"use client";

import { memo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

interface MessageBubbleProps {
    message: string | null;
    fileUrl: string | null;
    fileName: string | null;
    fileType: string | null;
    timestamp: string;
    isSent: boolean;
    isRead: boolean;
    senderName?: string;
}

export const MessageBubble = memo(function MessageBubble({
    message,
    fileUrl,
    fileName,
    fileType,
    timestamp,
    isSent,
    isRead,
    senderName,
}: MessageBubbleProps) {
    const isImage = fileType?.startsWith('image/');
    const isPDF = fileType === 'application/pdf';

    return (
        <div
            className={`flex items-end gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isSent ? 'flex-row-reverse' : 'flex-row'
                }`}
        >
            {!isSent && (
                <Avatar className="w-8 h-8 border-2 border-white shadow-sm shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                        {senderName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
            )}

            <div className={`flex flex-col ${isSent ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                {!isSent && senderName && (
                    <span className="text-xs text-slate-500 mb-1 px-2 font-medium">{senderName}</span>
                )}

                <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm transition-all duration-200 hover:shadow-md ${isSent
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-md'
                        }`}
                >
                    {/* Archivo adjunto */}
                    {fileUrl && (
                        <div className="mb-2">
                            {isImage ? (
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block group"
                                >
                                    <div className="relative rounded-lg overflow-hidden">
                                        <img
                                            src={fileUrl}
                                            alt={fileName || 'Imagen'}
                                            className="rounded-lg max-w-full h-auto max-h-64 object-cover transition-transform duration-200 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200"></div>
                                    </div>
                                </a>
                            ) : (
                                <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isSent
                                            ? 'bg-blue-600/50 hover:bg-blue-600/70'
                                            : 'bg-slate-100 hover:bg-slate-200'
                                        }`}
                                >
                                    <div className={`p-2 rounded-lg ${isSent ? 'bg-white/20' : 'bg-blue-100'}`}>
                                        {isPDF ? (
                                            <FileText className={`w-5 h-5 ${isSent ? 'text-white' : 'text-blue-600'}`} />
                                        ) : (
                                            <Download className={`w-5 h-5 ${isSent ? 'text-white' : 'text-blue-600'}`} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium truncate ${isSent ? 'text-white' : 'text-slate-800'}`}>
                                            {fileName || 'Archivo'}
                                        </p>
                                        <p className={`text-xs ${isSent ? 'text-blue-100' : 'text-slate-500'}`}>
                                            Clic para descargar
                                        </p>
                                    </div>
                                    <Download className={`w-4 h-4 shrink-0 ${isSent ? 'text-white' : 'text-slate-400'}`} />
                                </a>
                            )}
                        </div>
                    )}

                    {/* Mensaje de texto */}
                    {message && (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message}
                        </p>
                    )}

                    {/* Timestamp y estado de lectura */}
                    <div className={`flex items-center gap-1.5 mt-1.5 ${isSent ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-[11px] ${isSent ? 'text-blue-100' : 'text-slate-400'}`}>
                            {format(new Date(timestamp), 'HH:mm', { locale: es })}
                        </span>
                        {isSent && (
                            <span className="transition-all duration-200">
                                {isRead ? (
                                    <CheckCheck className="w-4 h-4 text-blue-100" />
                                ) : (
                                    <Check className="w-4 h-4 text-blue-200" />
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
