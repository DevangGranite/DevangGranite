if (!customElements.get('wallet-balance')) {
  class WalletBalance extends HTMLElement {
    constructor() {
      super();
      this.userId = window.getCookie('user_id');
      this.getWalletBalance();
    }

    getWalletBalance() {
      fetch(`https://alainappuat.gdadmin.org/shopifyApiV2/getbalance/${this.userId}`, {
        method: 'GET',
        headers: {
          'lancode': 'en',
          'token': 123456,
          'Content-type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(response => {
          const walletData = response.response;

          if (walletData) {
            this.querySelector('.customer-wallet-price').innerText = walletData.balance.toFixed(2);
          }
        })
    }
  }

  customElements.define('wallet-balance', WalletBalance);
}