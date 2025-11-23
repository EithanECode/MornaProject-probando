"use client";

import { useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface UseChatUploadOptions {
    maxSizeMB?: number;
    allowedTypes?: string[];
}

export function useChatUpload({
    maxSizeMB = 10,
    allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx']
}: UseChatUploadOptions = {}) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const supabase = getSupabaseBrowserClient();

    const uploadFile = useCallback(async (file: File) => {
        // Validar tamaño
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            setError(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`);
            return null;
        }

        try {
            setUploading(true);
            setProgress(0);
            setError(null);

            // Obtener usuario actual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('No hay usuario autenticado');
            }

            // Generar nombre único para el archivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Subir archivo a Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from('chat-files')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            // Obtener URL pública del archivo
            const { data: { publicUrl } } = supabase.storage
                .from('chat-files')
                .getPublicUrl(fileName);

            setProgress(100);

            return {
                url: publicUrl,
                name: file.name,
                type: file.type,
                size: file.size,
            };
        } catch (err) {
            console.error('Error uploading file:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return null;
        } finally {
            setUploading(false);
            setTimeout(() => setProgress(0), 1000);
        }
    }, [maxSizeMB, supabase]);

    const resetError = useCallback(() => {
        setError(null);
    }, []);

    return {
        uploadFile,
        uploading,
        progress,
        error,
        resetError,
    };
}
