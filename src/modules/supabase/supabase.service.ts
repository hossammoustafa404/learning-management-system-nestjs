import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabaseClient: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.supabaseClient = createClient(
      configService.get('SUPABASE_URL'),
      configService.get('SUPABASE_SECRET'),
    );
  }

  async uploadFile(
    bucketId: string,
    filePath: string,
    fileBody: any,
    fileOptions?: any,
  ) {
    const result = await this.supabaseClient.storage
      .from(bucketId)
      .upload(filePath, fileBody, fileOptions);

    return result;
  }

  getPublicUrl(bucketId: string, filePath: string) {
    const result = this.supabaseClient.storage
      .from(bucketId)
      .getPublicUrl(filePath);

    return result;
  }
}
