import React from 'react';

const Footer = () => {
  return (
    <div className="bg-gray-100 shadow-sm text-left font-normal">
      <table className="ml-14 px-4 py-4 w-[90%] text-sm">
        <thead>
          <tr>
            <th className=" w-[129.71px] h-[17px]">
              <img className="h-5" src="https://zerodha.com/static/images/logo.svg" alt="Zerodha Logo" />
            </th>
            <th className="pb-2 pr-10">Company</th>
            <th className="pb-2 pr-10">Support</th>
            <th className="pb-2">Account</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          <tr>
            <td className="py-1">
              <p className="flex items-center gap-1">
                <img className="h-[8px]" src="https://www.svgrepo.com/show/8448/call-volume.svg" alt="" />
                +91 80 4718 1888
              </p>
            </td>
            <td>About</td>
            <td>Contact</td>
            <td>Open an Account</td>
          </tr>
          <tr>
            <td className="py-1">© 2010 - 2020</td>
            <td>Product</td>
            <td>Support Portal</td>
            <td>Fund Transfer</td>
          </tr>
          <tr>
            <td className="py-1">Zerodha Broking Ltd.</td>
            <td>Pricing</td>
            <td>Z-Connect blog</td>
            <td>60 day challenge</td>
          </tr>
          <tr>
            <td className="py-1">All rights reserved.</td>
            <td>Careers</td>
            <td>Downloads & resources</td>
            <td>Zerodha Cares (CSR)</td>
          </tr>
          <tr>
            <td className="py-1">Bangalore</td>
            <td>Zerodha.tech</td>
            <td>Fund transfer</td>
            <td>60 day challenge</td>
          </tr>
          <tr>
            <td className="py-1">Kite App</td>
            <td>Referral programme</td>
            <td>Careers</td>
            <td>Zerodha Cares (CSR)</td>
          </tr>
        </tbody>
      </table>

      {/* Legal Text Sections */}
      <div className="text-[10px] text-gray-500 mx-14 mt-2 space-y-4">
        <p>
          Zerodha Broking Ltd.: Member of NSE​ &​ BSE – SEBI Registration no.: INZ000031633 CDSL: Depository services through Zerodha Broking Ltd. – SEBI Registration no.: IN-DP-431-2019 Commodity Trading through Zerodha Commodities Pvt. Ltd. MCX: 46025 – SEBI Registration no.: INZ000038238 Registered Address: Zerodha Broking Ltd., #153/154, 4th Cross, Dollars Colony, Opp. Clarence Public School, J.P Nagar 4th Phase, Bengaluru - 560078, Karnataka, India. For any complaints pertaining to securities broking please write to complaints@zerodha.com, for DP related to dp@zerodha.com. Please ensure you carefully read the Risk Disclosure Document as prescribed by SEBI | ICF
        </p>
        <p>
          Procedure to file a complaint on SEBI SCORES: Register on SCORES portal. Mandatory details for filing complaints on SCORES: Name, PAN, Address, Mobile Number, E-mail ID. Benefits: Effective Communication, Speedy redressal of the grievances
        </p>
        <p>
          Investments in securities market are subject to market risks; read all the related documents carefully before investing.
        </p>
        <p>
          "Prevent unauthorised transactions in your account. Update your mobile numbers/email IDs with your stock brokers. Receive information of your transactions directly from Exchange on your mobile/email at the end of the day. Issued in the interest of investors. KYC is one time exercise while dealing in securities markets - once KYC is done through a SEBI registered intermediary (broker, DP, Mutual Fund etc.), you need not undergo the same process again when you approach another intermediary." Dear Investor, if you are subscribing to an IPO, there is no need to issue a cheque. Please write the Bank account number and sign the IPO application form to authorize your bank to make payment in case of allotment. In case of non allotment the funds will remain in your bank account. As a business we don't give stock tips, and have not authorized anyone to trade on behalf of others. If you find anyone claiming to be part of Zerodha and offering such services, please create a ticket here.
        </p>
      </div>

      {/* Bottom Links */}
      <div className="flex flex-wrap gap-10 justify-start ml-[105px] mr-14 mt-4 text-[12px] text-gray-600">
        {[
          "NSE",
          "BSE",
          "MCX",
          "Terms & conditions",
          "Policies & procedures",
          "Privacy Policy",
          "Disclosure",
        ].map((item, idx) => (
          <div key={idx}>{item}</div>
        ))}
      </div>
    </div>
  );
};

export default Footer;
