function getCommonTemplate(data) {
  return `
  <!DOCTYPE html>
  <html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
      <style>
        :root {
          color-scheme: light dark;
          supported-color-schemes: light dark;
        }

        .body,
        .container {
          font-family: sans-serif;
          color: #39444d;
        }

        .container {
          padding: 30px;
        }

        h1 {
          font-size: 32px;
          font-weight: 600;
          margin: 0 0 20px 0;
        }

        h2 {
          font-size: 24px;
          font-weight: 400;
          margin: 24px 0 8px 0;
        }

        h3 {
          font-size: 18px;
          font-weight: 600;
        }

        p {
          font-size: 16px;
          line-height: 24px;
          margin: 0 0 24px 0;
        }

        hr {
          border: 1px solid #c5ced6;
          margin: 48px 0 48px 0;
        }

        a,
        a:visited {
          color: #1273e6;
        }

        .logo {
          margin: 0 0 58px 0;
        }

        a.social,
        a.social:visited {
          font-size: 14px;
          color: #626f7a;
        }
      </style>
    </head>
    <body class="body">
      <div style="font-size:16px; font-size:1rem;">
        <div class="container">
          <!--[if true]>
          <table role="presentation" width="100%" align="center" style="background:#ffffff">
            <tr>
              <td></td>
              <td style="width:600px;background:#ffffff;padding:24px;">
          <![endif]-->
                <div style="max-width:600px; margin:0 auto;background:#ffffff;padding:0 24px;mso-padding-alt:0;">
                ${data}
                </div>
              <!--[if true]>
              </td>
            </tr>
          </table>
          <![endif]-->
          </div>
        </div>
      </body>
    </html>
  `;
}

module.exports = getCommonTemplate;
