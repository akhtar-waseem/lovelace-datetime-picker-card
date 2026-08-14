import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from '../css/confirm-dialog.css';

@customElement('datetime-confirm-dialog')
export class DateTimeConfirmDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) title = '';
  @property({ type: String }) message = '';

  static styles = styles;
  
  render(): TemplateResult {
    if (!this.open) return html``;

    return html`
      <div class="overlay" @click=${this._cancel}>
        <div class="dialog" @click=${(e: Event) => e.stopPropagation()}>
          <div class="header">
            <button class="close-btn" @click=${this._cancel}>
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
            <span class="title">${this.title}</span>
          </div>

          <div class="body">
            <p class="message">${this.message}</p>
          </div>

          <div class="footer">
            <button class="btn btn-secondary" @click=${this._cancel}>
              Cancel
            </button>
            <button class="btn btn-primary" @click=${this._confirm}>
              OK
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private _cancel(): void {
    this.dispatchEvent(new CustomEvent('confirm-closed', { bubbles: true, composed: true }));
  }

  private _confirm(): void {
    this.dispatchEvent(new CustomEvent('confirm-approved', { bubbles: true, composed: true }));
  }
}