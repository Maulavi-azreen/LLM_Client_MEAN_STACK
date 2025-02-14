import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ChatService } from '../../../service/chat.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  userInput: string = '';
  chatMessages: any[] = [];
  isLoading: boolean = false;

  constructor(private chatService: ChatService) {}

  sendMessage() {
    if (this.userInput.trim() === '') return;

    this.chatMessages.push({ sender: 'user', content: this.userInput });
    this.isLoading = true;

    let currentMessage = { sender: 'bot', content: '' };
    this.chatMessages.push(currentMessage);

    this.chatService.sendMessage(this.userInput).subscribe({
      next: (response) => {
        if (response.type === 'deep-thinking') {
          // You can handle deep thinking separately if needed
          console.log('Deep thinking:', response.content);
        } else if (response.type === 'final-response') {
          currentMessage.content += response.content;
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.chatMessages.pop(); // Remove the bot message if there's an error
        this.chatMessages.push({ sender: 'bot', content: 'Sorry, an error occurred.' });
      },
      complete: () => {
        this.isLoading = false;
        this.userInput = '';
      }
    });
  }
}
