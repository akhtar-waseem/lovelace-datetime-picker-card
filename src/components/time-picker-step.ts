import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import styles from '../css/time-picker-step.css';

@customElement('time-picker-step')
export class TimePickerStep extends LitElement {
  @property({ type: String }) public value: string = '12:00:00';

  @state() private _mode: 'hours' | 'minutes' = 'hours';
  @state() private _selectedHour: number = 12; // 0..23
  @state() private _selectedMinute: number = 0; // 0..59
  @state() private _isDragging: boolean = false;

  static styles = styles;

  protected firstUpdated(): void {
    if (this.value) {
      this._parseValue(this.value);
    }
  }

  private _parseValue(timeStr: string): void {
    const parts = timeStr.split(':');
    const rawHour = parseInt(parts[0] || '12', 10);
    const rawMin = parseInt(parts[1] || '00', 10);

    this._selectedHour = isNaN(rawHour) ? 12 : Math.min(Math.max(rawHour, 0), 23);
    this._selectedMinute = isNaN(rawMin) ? 0 : Math.min(Math.max(rawMin, 0), 59);
  }

  private _notifyChange(): void {
    const hh = String(this._selectedHour).padStart(2, '0');
    const mm = String(this._selectedMinute).padStart(2, '0');

    this.dispatchEvent(
      new CustomEvent('time-changed', {
        detail: { value: `${hh}:${mm}:00` },
        bubbles: true,
        composed: true,
      })
    );
  }

private _handlePointerMove(e: PointerEvent): void {
  if (!this._isDragging && e.type !== 'pointerdown') return;

  // Stop move events from reaching parent modal listeners
  e.stopPropagation();

  const dial = this.shadowRoot?.querySelector('.clock-dial') as HTMLElement;
  if (!dial) return;

  const rect = dial.getBoundingClientRect();
  const radius = rect.width / 2;
  const centerX = rect.left + radius;
  const centerY = rect.top + radius;

  const x = e.clientX - centerX;
  const y = e.clientY - centerY;

  const distanceRatio = Math.sqrt(x * x + y * y) / radius;

  let deg = Math.atan2(y, x) * (180 / Math.PI) + 90;
  if (deg < 0) deg += 360;

  if (this._mode === 'hours') {
    const step = Math.round(deg / 30) % 12;
    const isInnerRing = distanceRatio < 0.61;

    this._selectedHour = isInnerRing ? step + 12 : step;
  } else {
    let minute = Math.round(deg / 6);
    if (minute === 60) minute = 0;
    this._selectedMinute = minute;
  }

  this._notifyChange();
}

  private _onPointerDown(e: PointerEvent): void {
    e.stopPropagation();
    this._isDragging = true;
    const target = e.currentTarget as HTMLElement;
    if (target && target.setPointerCapture) {
      target.setPointerCapture(e.pointerId);
    }
    this._handlePointerMove(e);
  }

  private _onPointerUp(e: PointerEvent): void {
    e.stopPropagation();

    if (this._isDragging) {
      this._isDragging = false;

      const target = e.currentTarget as HTMLElement;
      if (target && target.hasPointerCapture && target.hasPointerCapture(e.pointerId)) {
        target.releasePointerCapture(e.pointerId);
      }

      if (this._mode === 'hours') {
        this._mode = 'minutes';
      }
  }
}

  render(): TemplateResult {
    const displayHour = String(this._selectedHour).padStart(2, '0');
    const displayMin = String(this._selectedMinute).padStart(2, '0');

    // Calculate SVG coordinates (ViewBox 200x200, center at 100,100)
    let handRadius = 74; // Outer ring (37% of 200)
    let handAngleRad = 0;

    if (this._mode === 'hours') {
      const isInner = this._selectedHour >= 12;
      handRadius = isInner ? 48 : 74; // Inner ring (24%) vs Outer ring (37%)
      const hourStep = this._selectedHour % 12;
      handAngleRad = (hourStep * 30 - 90) * (Math.PI / 180);
    } else {
      handRadius = 74;
      handAngleRad = (this._selectedMinute * 6 - 90) * (Math.PI / 180);
    }

    const handX = 100 + handRadius * Math.cos(handAngleRad);
    const handY = 100 + handRadius * Math.sin(handAngleRad);

    // Outer hours: 0-11, Inner hours: 12-23
    const outerHours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const innerHours = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const minutesList = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    return html`
      <div class="clock-container">
        <!-- Header Digits Display -->
        <div class="time-header">
          <div class="time-digits">
            <span
              class="digit-btn ${this._mode === 'hours' ? 'active' : ''}"
              @click=${() => (this._mode = 'hours')}
            >
              ${displayHour}
            </span>
            <span class="colon">:</span>
            <span
              class="digit-btn ${this._mode === 'minutes' ? 'active' : ''}"
              @click=${() => (this._mode = 'minutes')}
            >
              ${displayMin}
            </span>
          </div>
        </div>

        <!-- Clock Dial Container -->
        <div
          class="clock-dial"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._handlePointerMove}
          @pointerup=${this._onPointerUp}
          @touchstart=${(e: TouchEvent) => e.stopPropagation()}
          @touchmove=${(e: TouchEvent) => e.stopPropagation()}
        >
          <!-- Vector Clock Pointer Hand -->
          <svg class="clock-svg" viewBox="0 0 200 200">
            <line x1="100" y1="100" x2="${handX}" y2="${handY}" class="hand-line" />
            <circle cx="${handX}" cy="${handY}" r="15" class="hand-head" />
            <circle cx="100" cy="100" r="4" class="center-dot" />
          </svg>

          <!-- Dial Numbers -->
          ${this._mode === 'hours'
            ? html`
                <!-- Outer Ring (0-11) -->
                ${outerHours.map((h, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x = 50 + 37 * Math.cos(angle);
                  const y = 50 + 37 * Math.sin(angle);
                  return html`
                    <div
                      class="dial-node ${this._selectedHour === h ? 'selected' : ''}"
                      style="left: ${x}%; top: ${y}%;"
                    >
                      ${h}
                    </div>
                  `;
                })}

                <!-- Inner Ring (12-23) -->
                ${innerHours.map((h, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x = 50 + 24 * Math.cos(angle);
                  const y = 50 + 24 * Math.sin(angle);
                  return html`
                    <div
                      class="dial-node inner-node ${this._selectedHour === h ? 'selected' : ''}"
                      style="left: ${x}%; top: ${y}%;"
                    >
                      ${h}
                    </div>
                  `;
                })}
              `
            : html`
                <!-- Minute Ring -->
                ${minutesList.map((m, i) => {
                  const angle = (i * 30 - 90) * (Math.PI / 180);
                  const x = 50 + 37 * Math.cos(angle);
                  const y = 50 + 37 * Math.sin(angle);
                  return html`
                    <div
                      class="dial-node ${this._selectedMinute === m ? 'selected' : ''}"
                      style="left: ${x}%; top: ${y}%;"
                    >
                      ${String(m).padStart(2, '0')}
                    </div>
                  `;
                })}
              `}
        </div>
      </div>
    `;
  }
}