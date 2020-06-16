import { LitElement, html, css } from 'lit-element';

class LoadingSpinner extends LitElement {
  static get styles() {
    return css`
      .spinner {
        margin: 50px auto;
        text-align: center;
      }
      .loader {
        border: 3px solid #d6336c;
        width: 200px;
        height: 200px;
        border-radius: 50%;
        border-left-color: transparent;
        border-right-color: transparent;
        margin: auto;
        animation: rotate 2s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite;
      }
      #loader2 {
        border: 3px solid #3bc9db;
        width: 220px;
        height: 220px;
        position: relative;
        top: -216px;
        border-left-color: transparent;
        border-right-color: transparent;
        animation: rotate2 2s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite;
      }
      #loader3 {
        border: 3px solid #d6336c;
        width: 240px;
        height: 240px;
        position: relative;
        top: -452px;
        border-left-color: transparent;
        border-right-color: transparent;
        animation: rotate 2s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite;
      }
      #loader4 {
        border: 3px solid #3bc9db;
        width: 260px;
        height: 260px;
        position: relative;
        top: -708px;
        border-left-color: transparent;
        border-right-color: transparent;
        animation: rotate2 2s cubic-bezier(0.26, 1.36, 0.74, -0.29) infinite;
      }
      @keyframes rotate {
        0% {
          transform: rotateZ(-360deg);
        }
        100% {
          transform: rotateZ(0deg);
        }
      }
      @keyframes rotate2 {
        0% {
          transform: rotateZ(360deg);
        }
        100% {
          transform: rotateZ(0deg);
        }
      }
      #text {
        color: black;
        font-family: Arial;
        font-size: 20px;
        position: relative;
        top: -857px;
      }
    `;
  }

  render() {
    return html`
      <div class="spinner">
        <div class="loader" id="loader"></div>
        <div class="loader" id="loader2"></div>
        <div class="loader" id="loader3"></div>
        <div class="loader" id="loader4"></div>
        <span id="text">LOADING...</span><br />
      </div>
    `;
  }
}

customElements.define('loading-spinner', LoadingSpinner);
