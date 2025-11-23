"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { Send, Paperclip, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatUpload } from '@/hooks/use-chat-upload';

interface ChatInputProps {
    onSendMessage: (message: string, fileData?: { url: string; name: string; type: string; size: number }) => Promise<void>;
    onTyping: () => void;
    onStopTyping?: () => void;
    disabled?: boolean;
}

export function ChatInput({ onSendMessage, onTyping, onStopTyping, disabled }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploadFile, uploading, error: uploadError } = useChatUpload();

    const handleSend = async () => {
        if ((!message.trim() && !selectedFile) || sending || disabled) return;

        try {
            setSending(true);

            // Detener indicador de "escribiendo..." inmediatamente
            if (onStopTyping) {
                onStopTyping();
            }

            let fileData;
            if (selectedFile) {
                fileData = await uploadFile(selectedFile);
                if (!fileData) {
                    console.error('Error al subir archivo');
                    return;
                }
            }

            await onSendMessage(message.trim(), fileData || undefined);

            setMessage('');
            setSelectedFile(null);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        onTyping();

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const isImage = selectedFile?.type.startsWith('image/');

    return (
        <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
            {/* Preview de archivo seleccionado */}
            {selectedFile && (
                <div className="mb-3 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            {isImage ? (
                                <ImageIcon className="w-5 h-5 text-blue-600" />
                            ) : (
                                <Paperclip className="w-5 h-5 text-blue-600" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{selectedFile.name}</p>
                            <p className="text-xs text-slate-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Error de upload */}
            {uploadError && (
                <div className="mb-3 animate-in slide-in-from-bottom-2 duration-200">
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                        {uploadError}
                    </div>
                </div>
            )}

            <div className="flex items-end gap-2">
                {/* Botón de adjuntar archivo */}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || uploading || sending}
                    className="shrink-0 h-10 w-10 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200"
                >
                    <Paperclip className="w-5 h-5" />
                </Button>

                {/* Textarea */}
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Escribe un mensaje..."
                    disabled={disabled || sending}
                    className="resize-none min-h-[40px] max-h-[120px] bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200 text-slate-800 placeholder:text-slate-400 transition-all duration-200"
                    rows={1}
                />

                {/* Botón de enviar */}
                <Button
                    onClick={handleSend}
                    disabled={(!message.trim() && !selectedFile) || disabled || sending || uploading}
                    size="icon"
                    className="shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50"
                >
                    {sending || uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </Button>
            </div>

            <p className="text-xs text-slate-500 mt-2 text-center">
                Presiona <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Enter</kbd> para enviar, <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px]">Shift + Enter</kbd> para nueva línea
            </p>
        </div>
    );
}
