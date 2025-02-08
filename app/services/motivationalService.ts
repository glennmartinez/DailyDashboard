// File: app/services/motivationalService.ts

export class MotivationalService {
  private static messages: string[] = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Everything you've ever wanted is on the other side of fear. - George Addair",
    "The only limit to our realization of tomorrow will be our doubts of today. - Franklin D. Roosevelt",
  ];

  // This method can be extended to make API calls in the future
  public async getMessageOfTheDay(): Promise<string> {
    // For now, return a random message
    // In future, this could be replaced with an API call
    const randomIndex = Math.floor(
      Math.random() * MotivationalService.messages.length
    );
    return MotivationalService.messages[randomIndex];
  }
}
