if (!customElements.get('wallet-balance')) {
  class WalletBalance extends HTMLElement {
    constructor() {
      super();
      this.userId = document.querySelector('[name="meta[user_id]"]').value;
      this.page = 0;
      this.initDataFields();
      this.closeHelpWallet.style.display = 'none'; // Hide the close button initially
      this.eventListeners();
      this.getWalletBalance();
    }
    openTab(event) {
      let tabContents = document.querySelectorAll('.tab-content'),
          tabs = document.querySelectorAll('.tab');
      tabContents.forEach((content) => {
        content.classList.remove('active');
      });
      tabs.forEach(function(tab) {
        tab.classList.remove('active');
      });
      document.getElementById(event.currentTarget.dataset.tab).classList.add('active');
      event.currentTarget.classList.add('active');
    }
    eventListeners() {
     this.openHelpWallet.addEventListener('click', () => {
       this.fadeIn(this.helpDiv);
       this.fadeOut(this.detailDiv);
       this.closeButton.style.display = 'flex'; // Show the close button
       this.openButton.style.display = 'none'; // Hide the open button
      });

      this.closeHelpWallet.addEventListener('click', () => {
        this.fadeIn(this.detailDiv);
        this.fadeOut(this.helpDiv);
        this.closeButton.style.display = 'none'; // Hide the close button
        this.openButton.style.display = 'flex'; // Show the open button
      });

      this.debitedSwitch.addEventListener('click', (event) => {
        this.openTab(event);
      });
      this.creditedSwitch.addEventListener('click', (event) => {
        this.openTab(event);
      });
      this.reloadButton.addEventListener('click', () => {
        location.reload();
      })
    }
    fadeIn(element) {
      element.classList.remove('hidden');
      setTimeout(function() {
        element.style.opacity = '1';
      }, 10); // Delay to allow opacity change to take effect before display change
    }

    fadeOut(element) {
      setTimeout(function() {
        element.style.opacity = '0';
      }, 10); // Delay to allow opacity change to take effect before display change
      setTimeout(function() {
        element.classList.add('hidden');
      }, 500); // Matches transition duration (0.5s)
    }
    initDataFields() {
      this.positiveBalance = this.querySelector('.my_wallet_data_blocks_main');
      this.zeroBalance = this.querySelector('.zero_wallet_top_up');
      this.openHelpWallet = this.querySelector('.open_help_wallet');
      this.closeHelpWallet = this.querySelector('.close_help_wallet');
      this.detailDiv = this.querySelector('.total_ballane_detail_div');
      this.helpDiv = this.querySelector('.total_ballane_detail_help_div');
      this.closeButton = this.querySelector('.close_help_wallet');
      this.openButton = this.querySelector('.open_help_wallet');
      this.balance = this.querySelector('[data-balance]');
      this.total = this.querySelector('[data-total]');
      this.queueOrders = this.querySelector('[data-queue-orders]');
      this.queueAmount = this.querySelector('[data-queue-amount]');
      this.debitedSwitch = this.querySelector('.button_wallet_Debited');
      this.creditedSwitch = this.querySelector('.button_wallet_Credited');
      this.reloadButton = this.querySelector('[data-reload]');
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
            this.balance.innerText = walletData.balance.toFixed(2);
            this.total.innerText = walletData.totalBalance.toFixed(2);
            this.queueOrders.innerText = walletData.ordersInQueue;
            this.queueAmount.innerText = walletData.queueBalance;
            if (parseInt(walletData.balance) > 0) {
              this.getWalletOrders('debit', 'tab1');
              this.getWalletOrders('credit', 'tab2');
              this.positiveBalance.style.display = 'block';
            } else {
              this.zeroBalance.style.display = 'flex';
            }
          }
        })
    }
    getWalletOrders(transType, tabId) {
      fetch(`https://alainappuat.gdadmin.org/shopifyApiV3/transactionHistory/${this.userId}/${transType}/0`, {
        method: 'GET',
        headers: {
          'lancode': 'en',
          'token': 123456,
          'Content-type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(response => {
          const transactions = response.response[transType];
          if (response.response[transType].length) {
            this.createTransactionsList(transactions, transType, tabId);
          } else {
            document.getElementById(tabId).querySelector('.zero-wallet-transactions').style.display = 'flex';
          }
        })
    }
    createTransactionsList(transactions, type, tabId) {
      let transactionsList = [];
      let sectionDate = new Date(transactions[0].Doc_Date),
          sectionMonth = this.fullMonth(sectionDate);

      transactions.forEach((transaction, index) => {
        let transactionDate = new Date(transaction.Doc_Date), transactionMonth = this.fullMonth(transactionDate);
        if (transactionMonth !== sectionMonth) {
          sectionMonth = transactionMonth;

          transactionsList.push(`</div>`);
          transactionsList.push(this.monthItem(sectionMonth.toUpperCase()));
          transactionsList.push(`<div class="my_wallet_data_blocks_inner">`);
        } else if (index === 0) {
          transactionsList.push(this.monthItem(sectionMonth.toUpperCase()));
          transactionsList.push(`<div class="my_wallet_data_blocks_inner">`);
        }
        transactionsList.push(this.transactionItem(type, this.prettyDate(transactionDate), transaction.Doc_Amt));
      });

      document.getElementById(tabId).insertAdjacentHTML('afterbegin', transactionsList.join(''));
    }
    prettyDate(date) {
      return date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear();
    }
    fullMonth(date) {
      return date.toLocaleString('default', { month: 'long' })
    }
    monthItem(month) {
      return `<div class="wallet_debited_month">${month}</div>`;
    }
    transactionItem(type, date, amount) {
      return `<div class="my_wallet_data_blocks">
            <div class="my_wallet_data_blocks_icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="20" cy="20.0001" r="20" fill="#CDD5DD"/>
<g clip-path="url(#clip0_3224_8979)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.0659 11.0749C11.2768 11.0749 10.5201 11.3883 9.9622 11.9463C9.40426 12.5042 9.09082 13.2609 9.09082 14.0499V16.0338H30.909V14.0499C30.909 13.6592 30.8321 13.2724 30.6825 12.9114C30.533 12.5505 30.3139 12.2225 30.0376 11.9463C29.7614 11.67 29.4334 11.4508 29.0725 11.3013C28.7115 11.1518 28.3246 11.0749 27.9339 11.0749H12.0659ZM30.909 18.0162H9.09082V25.9502C9.09082 26.3409 9.16777 26.7278 9.31728 27.0887C9.46679 27.4497 9.68594 27.7776 9.9622 28.0539C10.2385 28.3302 10.5664 28.5493 10.9274 28.6988C11.2883 28.8483 11.6752 28.9253 12.0659 28.9253H27.9339C28.3246 28.9253 28.7115 28.8483 29.0725 28.6988C29.4334 28.5493 29.7614 28.3302 30.0376 28.0539C30.3139 27.7776 30.533 27.4497 30.6825 27.0887C30.8321 26.7278 30.909 26.3409 30.909 25.9502V18.0162ZM13.9126 26.078H17.3194C17.717 26.0768 18.0981 25.9183 18.3792 25.6371C18.6604 25.3559 18.8189 24.9749 18.8202 24.5772C18.8194 24.1794 18.661 23.7982 18.3797 23.5169C18.0984 23.2356 17.7172 23.0773 17.3194 23.0764H13.9126C13.5149 23.0773 13.1336 23.2356 12.8523 23.5169C12.5711 23.7982 12.4127 24.1794 12.4119 24.5772C12.4131 24.9749 12.5716 25.3559 12.8528 25.6371C13.134 25.9183 13.515 26.0768 13.9126 26.078Z" fill="white"/>
</g>
<defs>
<clipPath id="clip0_3224_8979">
<rect width="21.8182" height="21.8182" fill="white" transform="translate(9.09082 9.09097)"/>
</clipPath>
</defs>
</svg>

            </div>
            <div class="my_wallet_transection_type">
              <span class="transaction--type">${type}ed</span>
              <span>${date}</span>
            </div>

            <div class="my_wallet_bloks_price_main">
              <span class="my_wallet_bloks_price-currancy">${type === 'credit' ? '+' : '-'} AED</span>
              <span class="my_wallet_bloks_price">${Math.abs(amount)}</span>
            </div>
          </div>`;
    }
  }

  customElements.define('wallet-balance', WalletBalance);
}