import { LitElement, html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import styles from '../css/date-picker-step.css';

@customElement('date-picker-step')
export class DatePickerStep extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: String }) public value: string = '';

  @state() private _viewDate: Date = new Date();
  @state() private _selectedDate: Date = new Date();

  static styles = styles;

  protected firstUpdated(): void {
    this._initDate();
  }

  protected updated(changedProps: Map<string, unknown>): void {
    if (changedProps.has('value')) {
      this._initDate();
    }
  }

  private _initDate(): void {
    if (!this.value) return;
    const datePart = this.value.split('T')[0].split(' ')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const parsed = new Date(year, month, day);
      if (!isNaN(parsed.getTime())) {
        this._selectedDate = parsed;
        this._viewDate = new Date(year, month, 1);
      }
    }
  }

  private get _lang(): string {
    return this.hass?.locale?.language || this.hass?.language || navigator.language || 'en-US';
  }

  private _formatMonthYear(): string {
    return new Intl.DateTimeFormat(this._lang, {
      month: 'long',
      year: 'numeric',
    }).format(this._viewDate);
  }

  private _prevMonth(e: Event): void {
    e.stopPropagation();
    this._viewDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth() - 1, 1);
  }

  private _nextMonth(e: Event): void {
    e.stopPropagation();
    this._viewDate = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth() + 1, 1);
  }

  private _goToToday(e: Event): void {
    e.stopPropagation();
    const today = new Date();
    this._selectedDate = today;
    this._viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this._emitChange(today);
  }

  private _selectDay(day: number): void {
    const selected = new Date(this._viewDate.getFullYear(), this._viewDate.getMonth(), day);
    this._selectedDate = selected;
    this._emitChange(selected);
  }

  private _emitChange(dateObj: Date): void {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const mm = pad(dateObj.getMonth() + 1);
    const dd = pad(dateObj.getDate());
    const formattedIso = `${yyyy}-${mm}-${dd}`;

    this.value = formattedIso;
    this.dispatchEvent(
      new CustomEvent('date-changed', {
        detail: { value: formattedIso },
        bubbles: true,
        composed: true,
      })
    );
  }

  render(): TemplateResult {
    const year = this._viewDate.getFullYear();
    const month = this._viewDate.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const today = new Date();
    const isTodayInView = today.getFullYear() === year && today.getMonth() === month;
    const isSelectedInView =
      this._selectedDate.getFullYear() === year && this._selectedDate.getMonth() === month;

    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return html`
      <div class="inline-calendar">
        <!-- Month Header Navigation -->
        <div class="calendar-toolbar">
          <button class="nav-btn" @click=${this._prevMonth} title="Previous month">
            <ha-icon icon="mdi:chevron-left"></ha-icon>
          </button>
          <span class="month-year-title">${this._formatMonthYear()}</span>
          <div class="right-nav">
            <button class="today-icon-btn" @click=${this._goToToday} title="Go to today">
              <ha-icon icon="mdi:calendar-today"></ha-icon>
            </button>
            <button class="nav-btn" @click=${this._nextMonth} title="Next month">
              <ha-icon icon="mdi:chevron-right"></ha-icon>
            </button>
          </div>
        </div>

        <!-- Days Grid -->
        <div class="calendar-grid">
          ${weekdays.map((w) => html`<div class="weekday-header">${w}</div>`)}
          ${Array.from({ length: firstDayOfWeek }).map(() => html`<div class="day-cell empty"></div>`)}
          ${Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = isTodayInView && today.getDate() === dayNum;
            const isSelected = isSelectedInView && this._selectedDate.getDate() === dayNum;

            return html`
              <div class="day-cell">
                <button
                  class="day-btn ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}"
                  @click=${() => this._selectDay(dayNum)}
                >
                  ${dayNum}
                </button>
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }
}