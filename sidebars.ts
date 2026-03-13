module.exports = {
  api: [
    {
      type: 'category',
      label: 'PayIn APIs',     
      items: [
        'api/cryptobridge',
        'api/mobilemoney',
        'api/neosurf',
        'api/spei',
        'api/interacetransfer',
        'api/interacexpress',
      ],
    },
    {
      type: 'category',
      label: 'Customer APIs',     
      items: [
        'customer/create',
        'customer/get',
        'customer/patch',
      ]
    },
    {
      type: 'category',
      label: 'Verify Status',     
      items: [
        'verifystatus/payoutstatus',
        'verifystatus/purchasestatus',
        'verifystatus/refundstatus',
      ]
    },
    {
      type: 'category',
      label: 'Other Apis',     
      items: [
        'otherapi/getbalance',
        'otherapi/paymentmethod',
        'otherapi/cancelpurchase',
      ]
    },

  ],
  apmDocs: [
    // {
    //   type: "doc",
    //   id: "overview",
    //   label: "Overview",
    // },
    // {
    //   type: "doc",
    //   id: "environments",
    //   label: "Environments",
    // },
    // {
    //   type: "doc",
    //   id: "Integration Steps",
    //   label: "Integration Steps",
    // },
    // {
    //   type: "doc",
    //   id: "Webhook",
    //   label: "Webhook",
    // },
    // {
    //   type: "doc",
    //   id: "Status and Error Codes",
    //   label: "Status and Error Codes",
    // },
    {
      type: 'category',
      label: 'Basic Docs',
      items: [
        'overview',
        'environments',
        'Integration Steps',
        'Webhook',
        'Status and Error Codes',
      ]
    },
    {
      type: 'category',
      label: 'Payment Methods',
      items: [
        {
          type: 'category',
          label: 'Banks',
          items: [
            'apm/Cards',
            'apm/Bank Transfer',
            'apm/OnRamp',
            'apm/Openbanking',
          ],
        },
        {
          type: 'category',
          label: 'Alternative Payment Methods',
          items: [
            'apm/Interac E-Transfer',
            'apm/Interac Express',
            'apm/PIX',
            'apm/Mobile Money',
            'apm/SPEI',
            'apm/Neosurf',
            'apm/Crypto Bridge',
            'apm/Crypto Wallet',
            'apm/FawryPay',
            'apm/PayID',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Trust-Score',
      items: [
        'trust-score/trustScoreDetailed',
        'trust-score/checkTransactionAllowed',
      ],
    },
    {
      type: 'category',
      label: 'Cashier APIs',
      link: {
        type: 'doc',
        id: 'cashier-apis/cashier-apis',
      },
      items: [
        'cashier-apis/create-customer',
        'cashier-apis/Get-customer-details',
        'cashier-apis/Update-customer-details',
        'cashier-apis/Payin',
        'cashier-apis/Payout',
        'cashier-apis/Check-Status',

      ],
    },
  ],
};