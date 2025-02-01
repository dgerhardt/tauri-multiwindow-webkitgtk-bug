import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { error, info } from '@tauri-apps/plugin-log';

const urls = [
  'https://tauri.app',
  'https://example.com',
  'https://wikipedia.com',
  'https://google.com',
  'https://github.com',
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  url = signal(urls[0]);
  private index = 0;

  public openWindows() {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const webview = this.openWindowForUrl(urls[i % urls.length]);
      webview.once('tauri://window-created', () => {
        if (i != count - 1) {
          info('Closing webview: ' + webview.label);
          webview.close();
        }
      });
    }
  }

  public openWindowForUrl(url?: string): WebviewWindow {
    if (!url) {
      url = this.url();
      if (!url) {
        throw Error('No URL entered.');
      }
    }
    this.index++;
    const label = `webview-win-${this.index}`;
    info('Creating webview: ' + label);
    const webview = new WebviewWindow(label, {
      url: url,
      title: label + ': ' + url
    });
    webview.once('tauri://window-created', () => {
      info('Webview created: ' + label);
    });
    webview.once('tauri://error', (e) => {
      error('Webview creation failed: ' + label);
      error(JSON.stringify(e));
    });
    return webview;
  }
}
