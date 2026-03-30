/**
 * Script pour mettre à jour le cache-control de tous les mp3 existants dans le bucket Supabase.
 *
 * Usage: npx tsx scripts/fix-supabase-cache.ts
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function fixCache() {
  console.log("📦 Listing files in SUBLIME bucket...");

  const { data: files, error } = await supabase.storage.from("SUBLIME").list("", {
    limit: 1000,
  });

  if (error) {
    console.error("Error listing files:", error);
    process.exit(1);
  }

  const mp3Files = files.filter((f) => f.name.endsWith(".mp3"));
  console.log(`Found ${mp3Files.length} mp3 files. Updating cache headers...`);

  let updated = 0;
  let errors = 0;

  for (const file of mp3Files) {
    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("SUBLIME")
      .download(file.name);

    if (downloadError || !fileData) {
      console.error(`❌ Download failed: ${file.name}`, downloadError);
      errors++;
      continue;
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Re-upload with correct cache header
    const { error: uploadError } = await supabase.storage
      .from("SUBLIME")
      .upload(file.name, buffer, {
        contentType: "audio/mpeg",
        cacheControl: "31536000",
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ Upload failed: ${file.name}`, uploadError);
      errors++;
    } else {
      updated++;
      console.log(`✅ ${file.name} (${updated}/${mp3Files.length})`);
    }
  }

  console.log(`\nDone! Updated: ${updated}, Errors: ${errors}`);
}

fixCache();
