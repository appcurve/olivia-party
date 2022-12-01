const ORG_URL = 'https://olivia.party'
const FONT_FAMILY = 'sans-serif' // 'Arial,sans-serif'

/**
 * Return an HTML email template as a string based on the given input args.
 * The markup for the email was adapted from <https://codepen.io/tutsplus/pen/aboBgLX>.
 *
 * @future incorporate unsubscribe for possible future non-account emails
 */
export const buildHtmlEmail = (title: string, message: string, cta?: { url: string; caption: string }): string => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    table, td, div, h1, p {font-family: ${FONT_FAMILY};}
  </style>
</head>
<body style="margin:0;padding:0;">
  <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;background:#ffffff;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" style="width:602px;border-collapse:collapse;border:1px solid #cccccc;border-spacing:0;text-align:left;">
          <!--- headerBodyTableRow -->
          <tr>
            <td style="padding:36px 30px 42px 30px;">
              <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                <tr>
                  <td style="padding:0 0 36px 0;color:#153643;">
                    <h1 style="font-size:24px;margin:0 0 20px 0;font-family:${FONT_FAMILY};">${title}</h1>
                    <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};">${message}</p>
                    ${
                      cta
                        ? `<p style="margin:0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};"><a href="${cta.url}" style="color:#ee4c50;text-decoration:underline;">${cta.caption}</a></p>`
                        : ''
                    }
                    </td>
                </tr>
              </table>
            </td>
          </tr>
          <!--- twoColumnBodyTableRow -->
          <tr>
            <td style="padding:30px;background:#ee4c50;">
              <!--- footer inner table -->
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// preserving raw examples from the original template for future use --

export const boilerplateFirstRowBodyContent = `
                    <h1 style="font-size:24px;margin:0 0 20px 0;font-family:${FONT_FAMILY};">TITLE</h1>
                    <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan et dictum, nisi libero ultricies ipsum, posuere neque at erat.</p>
                    <p style="margin:0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">In tempus felis blandit</a></p>
`

export const headerBodyTableRow = `
          <tr>
            <td align="center" style="padding:40px 0 30px 0;background:#70bbd9;">
              <img src="https://assets.codepen.io/210284/h1.png" alt="" width="300" style="height:auto;display:block;" />
            </td>
          </tr>
`

export const twoColumnBodyTableRow = `
          <tr>
            <td style="padding:0;">
              <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
                <tr>
                  <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
                    <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};"><img src="https://assets.codepen.io/210284/left.gif" alt="" width="260" style="height:auto;display:block;" /></p>
                    <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};">Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed. Morbi porttitor, eget accumsan dictum, est nisi libero ultricies ipsum, in posuere mauris neque at erat.</p>
                    <p style="margin:0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">Blandit ipsum volutpat sed</a></p>
                  </td>
                  <td style="width:20px;padding:0;font-size:0;line-height:0;">&nbsp;</td>
                  <td style="width:260px;padding:0;vertical-align:top;color:#153643;">
                    <p style="margin:0 0 25px 0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};"><img src="https://assets.codepen.io/210284/right.gif" alt="" width="260" style="height:auto;display:block;" /></p>
                    <p style="margin:0 0 12px 0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};">Morbi porttitor, eget est accumsan dictum, nisi libero ultricies ipsum, in posuere mauris neque at erat. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In tempus adipiscing felis, sit amet blandit ipsum volutpat sed.</p>
                    <p style="margin:0;font-size:16px;line-height:24px;font-family:${FONT_FAMILY};"><a href="http://www.example.com" style="color:#ee4c50;text-decoration:underline;">In tempus felis blandit</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
`

export const footerInnerTable = `
              <table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;font-size:9px;font-family:Arial,sans-serif;">
                <tr>
                  <td style="padding:0;width:50%;" align="left">
                    <p style="margin:0;font-size:14px;line-height:16px;font-family:${FONT_FAMILY};color:#ffffff;">
                      &copy; Someone, Somewhere 2021<br/><a href="${ORG_URL}" style="color:#ffffff;text-decoration:underline;">Unsubscribe</a>
                    </p>
                  </td>
                  <td style="padding:0;width:50%;" align="right">
                    <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
                      <tr>
                        <td style="padding:0 0 0 10px;width:38px;">
                          <a href="http://www.twitter.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/tw_1.png" alt="Twitter" width="38" style="height:auto;display:block;border:0;" /></a>
                        </td>
                        <td style="padding:0 0 0 10px;width:38px;">
                          <a href="http://www.facebook.com/" style="color:#ffffff;"><img src="https://assets.codepen.io/210284/fb_1.png" alt="Facebook" width="38" style="height:auto;display:block;border:0;" /></a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
`
