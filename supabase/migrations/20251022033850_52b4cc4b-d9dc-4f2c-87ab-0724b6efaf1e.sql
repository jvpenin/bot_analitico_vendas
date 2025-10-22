-- Criar bucket para armazenar planilhas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'spreadsheets',
  'spreadsheets',
  false,
  52428800, -- 50MB
  ARRAY[
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ]
);

-- Políticas de acesso ao bucket
CREATE POLICY "Usuários podem fazer upload de planilhas"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'spreadsheets' AND
  (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Usuários podem visualizar planilhas públicas"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'spreadsheets' AND
  (storage.foldername(name))[1] = 'public'
);

CREATE POLICY "Usuários podem deletar suas planilhas"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'spreadsheets' AND
  (storage.foldername(name))[1] = 'public'
);