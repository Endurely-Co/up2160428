class ConnectionChecker extends HTMLElement{

    constructor() {
        super();
        this.style.backgroundColor = navigator.onLine ? '#2E7D32': '#B71C1C';
        this.style.height = '50px';
        this.style.width = '100%';
        // this.attachShadow({ mode: 'open' }).appendChild(
        //     templateContent.cloneNode(true)
        // );
    }

    connectedCallback(){
        console.log("ConnectionChecker connected");
    }

}

customElements.define('connection-status', ConnectionChecker);
