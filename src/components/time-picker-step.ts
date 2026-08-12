import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('time-picker-step')
export class TimePickerStep extends LitElement {
  @property({ type: String }) public value: string = '12:00:00';

  @state() private _mode: 'hours' | 'minutes' = 'hours';
  @state() private _selectedHour: number = 12;
  @state() private _selectedMinute: number = 0;
  @state() private _period: 'AM' | 'PM' = 'PM';
  @state() private _isDragging: boolean = false;

  protected firstUpdated(): void {
    if (this.value) {
      this._parseValue(this.value);
    }
  }

  private _parseValue(timeStr: string): void {
    const parts = timeStr.split(':');
    const rawHour = parseInt(parts[0] || '12', 10);
    const rawMin = parseInt(parts[1] || '00', 10);

    this._period = rawHour >= 12 ? 'PM' : 'AM';
    this._selectedHour = rawHour % 12 === 0 ? 12 : rawHour % 12;
    this._selectedMinute = isNaN(rawMin) ? 0 : rawMin;
  }

  private _notifyChange(): void {
    let hour24 = this._selectedHour;
    if (this._period === 'PM' && hour24 < 12) hour24 += 12;
    if (this._period === 'AM' && hour24 === 12) hour24 = 0;

    const hh = String(hour24).padStart(2, '0');
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

    const dial = this.shadowRoot?.querySelector('.clock-dial') as HTMLElement;
    if (!dial) return;

    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    let deg = Math.atan2(y, x) * (180 / Math.PI) + 90;
    if (deg < 0) deg += 360;

    if (this._mode === 'hours') {
      let hour = Math.round(deg / 30);
      if (hour === 0) hour = 12;
      this._selectedHour = hour;
    } else {
      let minute = Math.round(deg / 6);
      if (minute === 60) minute = 0;
      this._selectedMinute = minute;
    }

    this._notifyChange();
  }

  private _onPointerDown(e: PointerEvent): void {
    this._isDragging = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this._handlePointerMove(e);
  }

  private _onPointerUp(): void {
    if (this._isDragging) {
      this._isDragging = false;
      if (this._mode === 'hours') {
        this._mode = 'minutes';
      }
    }
  }

  private _togglePeriod(period: 'AM' | 'PM'): void {
    this._period = period;
    this._notifyChange();
  }

  render(): TemplateResult {
    const displayHour = String(this._selectedHour).padStart(2, '0');
    const displayMin = String(this._selectedMinute).padStart(2, '0');

    // Calculate rotation angle for clock hand
    const rotationDeg =
      this._mode === 'hours'
        ? (this._selectedHour % 12) * 30
        : this._selectedMinute * 6;

    return html`
      <div class="clock-container">
        <!-- Display Header -->
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

          <div class="period-toggle">
            <button
              class="period-btn ${this._period === 'AM' ? 'active' : ''}"
              @click=${() => this._togglePeriod('AM')}
            >
              AM
            </button>
            <button
              class="period-btn ${this._period === 'PM' ? 'active' : ''}"
              @click=${() => this._togglePeriod('PM')}
            >
              PM
            </button>
          </div>
        </div>

        <!-- Touch/Drag Radial Clock -->
        <div
          class="clock-dial"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._handlePointerMove}
          @pointerup=${this._onPointerUp}
        >
          <!-- Clock Hand Assembly -->
          <div
            class="clock-hand"
            style="transform: rotate(${rotationDeg}deg);"
          >
            <div class="center-dot"></div>
            <div class="hand-line"></div>
            <div class="hand-head"></div>
          </div>

          <!-- Number Nodes -->
          ${this._mode === 'hours'
            ? [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = Math.round(105 + 72 * Math.cos(angle));
                const y = Math.round(105 + 72 * Math.sin(angle));
                return html`
                  <div
                    class="dial-node ${this._selectedHour === h ? 'selected' : ''}"
                    style="left: ${x}px; top: ${y}px;"
                  >
                    ${h}
                  </div>
                `;
              })
            : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = Math.round(105 + 72 * Math.cos(angle));
                const y = Math.round(105 + 72 * Math.sin(angle));
                return html`
                  <div
                    class="dial-node ${this._selectedMinute === m ? 'selected' : ''}"
                    style="left: ${x}px; top: ${y}px;"
                  >
                    ${String(m).padStart(2, '0')}
                  </div>
                `;
              })}
        </div>
      </div>
    `;
  }

  static styles = css`
    .clock-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      user-select: none;
      touch-action: none;
    }
    .time-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .time-digits {
      display: flex;
      align-items: center;
      font-size: 2.2rem;
      font-weight: bold;
    }
    .digit-btn {
      padding: 6px 12px;
      border-radius: 8px;
      background: var(--secondary-background-color, #2a2a2a);
      color: var(--primary-text-color, #fff);
      cursor: pointer;
    }
    .digit-btn.active {
      background: var(--primary-color, #03a9f4);
      color: #ffffff;
    }
    .colon {
      margin: 0 4px;
      color: var(--primary-text-color, #fff);
    }
    .period-toggle {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .period-btn {
      padding: 4px 10px;
      border: 1px solid var(--divider-color, #444);
      background: transparent;
      color: var(--primary-text-color, #fff);
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.8rem;
    }
    .period-btn.active {
      background: var(--primary-color, #03a9f4);
      border-color: var(--primary-color, #03a9f4);
      color: #ffffff;
    }
    .clock-dial {
      position: relative;
      width: 210px;
      height: 210px;
      border-radius: 50%;
      background: var(--secondary-background-color, #252525);
      box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.4);
      cursor: pointer;
      touch-action: none;
    }
    .clock-hand {
      position: absolute;
      top: 0;
      left: 0;
      width: 210px;
      height: 210px;
      pointer-events: none;
      transform-origin: 105px 105px;
      transition: transform 0.05s ease-out;
    }
    .center-dot {
      position: absolute;
      left: 105px;
      top: 105px;
      width: 8px;
      height: 8px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: var(--primary-color, #03a9f4);
    }
    .hand-line {
      position: absolute;
      left: 104px;
      top: 33px;
      width: 2px;
      height: 72px;
      background: var(--primary-color, #03a9f4);
    }
    .hand-head {
      position: absolute;
      left: 105px;
      top: 33px;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background: var(--primary-color, #03a9f4);
    }
    .dial-node {
      position: absolute;
      width: 36px;
      height: 36px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      color: var(--primary-text-color, #fff);
      font-size: 0.95rem;
      font-weight: 500;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }
    .dial-node.selected {
      color: #ffffff;
      font-weight: bold;
    }
  `;
}