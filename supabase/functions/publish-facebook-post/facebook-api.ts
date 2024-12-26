interface FacebookPostData {
  message?: string;
  access_token: string;
  attached_media?: { media_fbid: string }[];
  url?: string;
  polling?: {
    options: string[];
    duration: number;
  };
}

export class FacebookAPI {
  private static async makeRequest(endpoint: string, data: FacebookPostData) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API Error:', errorData);
      throw new Error(`Facebook API Error: ${JSON.stringify(errorData)}`);
    }

    return response.json();
  }

  static async publishCarousel(pageId: string, imageUrls: string[], message: string, accessToken: string) {
    console.log('Publishing carousel post...');
    const endpoint = `https://graph.facebook.com/v18.0/${pageId}/photos`;
    const mediaIds = [];

    for (const imageUrl of imageUrls) {
      const result = await this.makeRequest(endpoint, {
        url: imageUrl.trim(),
        access_token: accessToken,
        published: false
      });
      mediaIds.push(result.id);
    }

    return this.makeRequest(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      message,
      access_token: accessToken,
      attached_media: mediaIds.map(id => ({ media_fbid: id }))
    });
  }

  static async publishSingleMedia(pageId: string, url: string, message: string, accessToken: string, isVideo: boolean) {
    console.log(`Publishing single ${isVideo ? 'video' : 'image'} post...`);
    const endpoint = `https://graph.facebook.com/v18.0/${pageId}/${isVideo ? 'videos' : 'photos'}`;
    return this.makeRequest(endpoint, {
      message,
      url,
      access_token: accessToken
    });
  }

  static async publishTextOrPoll(pageId: string, message: string, accessToken: string, pollOptions?: string[]) {
    console.log('Publishing text/poll post...');
    const postData: FacebookPostData = {
      message,
      access_token: accessToken
    };

    if (pollOptions?.length) {
      postData.polling = {
        options: pollOptions,
        duration: 86400 // 24 hours
      };
    }

    return this.makeRequest(`https://graph.facebook.com/v18.0/${pageId}/feed`, postData);
  }
}