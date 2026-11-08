import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import type { MediaAttachment } from './types';

export async function pickAndPersistMedia(): Promise<MediaAttachment | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const directory = new Directory(Paths.document, 'chat-media');
  directory.create({ idempotent: true, intermediates: true });
  const extension = asset.fileName?.split('.').pop() ?? (asset.type === 'video' ? 'mp4' : 'jpg');
  const destination = new File(
    directory,
    `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`,
  );
  await new File(asset.uri).copy(destination);

  return {
    uri: destination.uri,
    name: asset.fileName ?? destination.name,
    mimeType: asset.mimeType ?? undefined,
    type: asset.type === 'video' ? 'video' : 'image',
  };
}
