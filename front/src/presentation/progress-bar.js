import { LitElement, html, css } from 'lit-element';
import { getIntervalInMillisecs } from '../services/utils.mjs';

class ProgressBar extends LitElement {
  static get styles() {
    return css`
      :host {
        font-family: Verdana, sans-serif;
        font-size: 15px;
        line-height: 2;
      }
      .progress-bar-container {
        color: #000;
        background-color: #f1f1f1;
        border-radius: 8px;
        width: 100%;
      }
      .progress-indicator {
        padding: 0.01em 0;
        color: #fff;
        background-color: #2196f3;
        border-radius: 8px;
        width: var(--progress-percentage);
        height: 30px;
        text-align: center;
      }
    `;
  }

  static get properties() {
    return {
      start: { type: Number },
      end: { type: Number },
      current: { type: Number },
      interval: { type: String },
      show: { type: Boolean, attribute: false },
      currentPercentage: { type: Number, attribute: false },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.currentPercentage = 0;
    this._current = 0;
    this.style.setProperty('--progress-percentage', '0%');
    this.show = true;
  }

  set current(val) {
    const oldVal = this._current;
    this._current = val + getIntervalInMillisecs(this.interval);
    this.currentPercentage = Math.round(
      ((this._current - this.start) / (this.end - this.start)) * 100
    );
    if (this.currentPercentage === 100) {
      setTimeout(() => {
        this.show = false;
      }, 1000);
    }
    this.style.setProperty(
      '--progress-percentage',
      `${this.currentPercentage}%`
    );
    this.requestUpdate('current', oldVal);
  }

  render() {
    return this.show
      ? html` <div class="progress-bar-container">
          <div class="progress-indicator">
            ${this.currentPercentage}%
          </div>
        </div>`
      : html``;
  }
}

customElements.define('progress-bar', ProgressBar);
