export class SupabaseUploader {
    constructor() {
        this.supabaseUrl = 'https://vbjrfcgxzwjsgyadxlql.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZianJmY2d4endqc2d5YWR4bHFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMzQ1MjksImV4cCI6MjA3MzkxMDUyOX0.M4vNHAfj5XQlKCModUpCGVfpJ1TYB0EcDaMOt0ODF8k';
        this.bucketName = 'Marmeladka';
        
        this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
    }

    generateFileName(file) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop();
        return `service_${timestamp}_${randomString}.${extension}`;
    }

    async uploadFile(file) {
        try {
            const fileName = this.generateFileName(file);
            
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(fileName, file);

            if (error) {
                throw new Error(`Ошибка загрузки: ${error.message}`);
            }

            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(fileName);

            return {
                success: true,
                url: publicUrlData.publicUrl,
                fileName: fileName
            };
            
        } catch (error) {
            console.error('Ошибка загрузки на Supabase:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}