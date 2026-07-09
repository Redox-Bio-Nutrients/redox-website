// sanity/components/BulkImageInput.tsx
//
// WHY: The default array-of-images input uploads one at a time and
// leaves assets unnamed. This wraps it with a bulk-upload button that
// uploads every selected file and names the asset (title + alt) from
// the filename without its extension — "alfalfa.jpg" becomes "alfalfa".

import { useCallback, useRef, useState } from 'react'
import { Button, Stack } from '@sanity/ui'
import { insert, setIfMissing, useClient } from 'sanity'
import type { ArrayOfObjectsInputProps } from 'sanity'

export function BulkImageInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const { onChange } = props

  const uploadFiles = useCallback(
    async (files: FileList) => {
      const list = Array.from(files)
      let done = 0
      for (const file of list) {
        setStatus(`Uploading ${++done} of ${list.length}…`)
        const name = file.name.replace(/\.[^.]+$/, '')
        try {
          const asset = await client.assets.upload('image', file, {
            filename: file.name,
            title: name,
          })
          onChange([
            setIfMissing([]),
            insert(
              [
                {
                  _type: 'image',
                  _key: crypto.randomUUID(),
                  alt: name,
                  asset: { _type: 'reference', _ref: asset._id },
                },
              ],
              'after',
              [-1],
            ),
          ])
        } catch (err) {
          console.error(`Upload failed for ${file.name}`, err)
          setStatus(`Failed on ${file.name} — see console`)
          return
        }
      }
      setStatus(null)
    },
    [client, onChange],
  )

  return (
    <Stack space={3}>
      {props.renderDefault(props)}
      <Button
        text={status ?? 'Bulk upload images'}
        mode="ghost"
        tone="primary"
        disabled={status !== null}
        onClick={() => fileRef.current?.click()}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.currentTarget.files?.length) uploadFiles(e.currentTarget.files)
          e.currentTarget.value = ''
        }}
      />
    </Stack>
  )
}
