import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:5001'; // Adjust this to match your backend URL

  constructor(private http: HttpClient) {}

  sendMessage(query: string): Observable<any> {
    const response = new Subject<any>();
  
    // First, send the query using an HTTP POST request
    this.http.post(`${this.apiUrl}/chat`, { query }).subscribe(
      () => {
        // Then, open EventSource to receive streamed responses
        const eventSource = new EventSource(`${this.apiUrl}/chat-stream`);
  
        eventSource.onmessage = (event) => {
          response.next(JSON.parse(event.data));
        };
  
        eventSource.onerror = (error) => {
          console.error('EventSource failed:', error);
          eventSource.close();
          response.error(error);
        };
  
        eventSource.addEventListener('deep-thinking', (event: any) => {
          const content = JSON.parse(event.data).replace(/\\n/g, '\n'); // Ensure proper line breaks
          response.next({ type: 'deep-thinking', content });
        });
        
        eventSource.addEventListener('final-response', (event: any) => {
          const content = JSON.parse(event.data).replace(/\\n/g, '\n');
          response.next({ type: 'final-response', content });
        });
  
        eventSource.addEventListener('end', () => {
          eventSource.close();
          response.complete();
        });
      },
      (error) => {
        response.error(error);
      }
    );
  
    return response.asObservable();
  }
}