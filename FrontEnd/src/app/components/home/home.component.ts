import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AskService } from '../../services/ask.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  host: { class: 'flex min-h-0 flex-1 flex-col overflow-hidden' },
  template: `
    <div class="flex h-full flex-col">
      <!-- Scrollable message area -->
      <div class="flex-1 overflow-y-auto">
        <div class="mx-auto max-w-3xl px-4 py-8">
          @if (!lastTopic() && !loading()) {
            <!-- Empty state - Claude style -->
            <div class="flex flex-col items-center justify-center pt-24 text-center">
              <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c25b3a]/10">
                <svg class="h-8 w-8 text-[#c25b3a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 class="text-xl font-medium text-[#2d2a26]">What would you like to know?</h2>
              <p class="mt-2 max-w-md text-[#6b6560]">Ask any topic and get an AI-generated explanation.</p>
            </div>
          }

          @if (lastTopic(); as topic) {
            <!-- User message -->
            <div class="mb-8 flex gap-4">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2d2a26] text-white">
                <span class="text-sm font-medium">You</span>
              </div>
              <div class="min-w-0 flex-1 pt-0.5">
                <p class="whitespace-pre-wrap text-[#2d2a26]">{{ topic }}</p>
                @if (modelOverride) {
                  <p class="mt-1 text-xs text-[#6b6560]">Model: {{ modelOverride }}</p>
                }
              </div>
            </div>

            <!-- Assistant message -->
            <div class="mb-8 flex gap-4">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c25b3a] text-white">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div class="min-w-0 flex-1 border-l-2 border-[#c25b3a]/30 pl-4">
                @if (loading()) {
                  <div class="flex items-center gap-2 text-[#6b6560]">
                    <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-[#c25b3a]" style="animation-delay: 0ms"></span>
                    <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-[#c25b3a]" style="animation-delay: 150ms"></span>
                    <span class="inline-block h-2 w-2 animate-bounce rounded-full bg-[#c25b3a]" style="animation-delay: 300ms"></span>
                  </div>
                } @else if (error()) {
                  <p class="text-red-600">{{ error() }}</p>
                } @else if (answer()) {
                  <p class="whitespace-pre-wrap leading-relaxed text-[#2d2a26]">{{ answer() }}</p>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Bottom input area - Claude style -->
      <div class="border-t border-[#e5e0d8] bg-[#f5f0e8] px-4 pb-6 pt-4">
        <div class="mx-auto max-w-3xl">
          @if (showModelOverride()) {
            <div class="mb-2">
              <input
                type="text"
                [(ngModel)]="modelOverride"
                name="model_override"
                placeholder="Model override (optional)"
                class="w-full rounded-lg border border-[#d6d0c4] bg-white px-3 py-1.5 text-sm text-[#2d2a26] placeholder-[#9a948a] focus:border-[#c25b3a] focus:outline-none focus:ring-1 focus:ring-[#c25b3a]"
              />
            </div>
          }
          <form (ngSubmit)="onSubmit()" class="flex gap-3 rounded-2xl border border-[#d6d0c4] bg-white shadow-sm focus-within:border-[#c25b3a] focus-within:ring-2 focus-within:ring-[#c25b3a]/20">
            <textarea
              [(ngModel)]="topic"
              name="topic"
              rows="1"
              placeholder="Message…"
              class="min-h-[52px] flex-1 resize-none rounded-2xl border-0 bg-transparent px-4 py-3 text-[#2d2a26] placeholder-[#9a948a] focus:outline-none focus:ring-0"
              (keydown)="onKeydown($event)"
            ></textarea>
            <button
              type="submit"
              [disabled]="loading() || !topic.trim()"
              class="flex shrink-0 items-center justify-center self-end rounded-xl bg-[#c25b3a] p-3 text-white transition hover:bg-[#a84d2e] focus:outline-none focus:ring-2 focus:ring-[#c25b3a] focus:ring-offset-2 disabled:opacity-50 disabled:hover:bg-[#c25b3a]"
              aria-label="Send"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0l9-2-9-18-9 18 9-2z" />
              </svg>
            </button>
          </form>
          <button
            type="button"
            (click)="showModelOverride.set(!showModelOverride())"
            class="mt-2 text-xs text-[#6b6560] hover:text-[#c25b3a]"
          >
            {{ showModelOverride() ? 'Hide model override' : 'Model override (optional)' }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  topic = '';
  modelOverride = '';
  showModelOverride = signal(false);
  loading = signal(false);
  answer = signal<string | null>(null);
  error = signal<string | null>(null);
  lastTopic = signal<string | null>(null);

  constructor(private readonly askService: AskService) {}

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (this.topic.trim()) this.onSubmit();
    }
  }

  onSubmit(): void {
    const t = this.topic?.trim();
    if (!t) return;
    this.lastTopic.set(t);
    this.loading.set(true);
    this.answer.set(null);
    this.error.set(null);
    const request: { topic: string; model_override?: string } = { topic: t };
    const mo = this.modelOverride?.trim();
    if (mo) request.model_override = mo;
    this.askService.ask(request).subscribe({
      next: (res) => {
        this.answer.set(res.answer);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.message ?? 'Request failed');
        this.loading.set(false);
      }
    });
  }
}
