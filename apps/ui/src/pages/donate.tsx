import type { NextPage } from 'next'
import { PageLayout } from '../components/layout/PageLayout'

export const DonatePage: NextPage = (_props) => {
  return (
    <PageLayout.Prose heading={<>Donations &amp; Contributions</>} subheading="Support the Project">
      <p>
        OliviaParty is an independent, self-funded project that hosts a free platform and releases both software and
        hardware designs for free under the Apache 2.0 Open Source License.
      </p>
      <p>
        There are many ways for developers, creatives, educators, users, and community supporters to contribute to the
        project.
      </p>

      <h3>Developer Contributions</h3>
      <p>
        Contributions &amp; PR&apos;s are welcome are welcome from developers and those with related expertise in
        technical, creative, healthcare, and educational fields.
      </p>
      <p>
        If you&apos;re not sure where to start, please reach out and tell us about yourself, your background and
        expertise, and what area(s) you think you might be interested in helping out.
      </p>
      <p>
        Contributors are kindly reminded that any work they contribute to the project has their consent to be released
        under our open source terms.
      </p>
      <h3>Donations</h3>
      <p>Donations of funds and hardware are graciously accepted and will be used to advance the project.</p>
      <p>
        Financial resources help cover hard costs of hosting and other technical services, the acquisition of new
        hardware for design/development/tutorials, and pay for the time and attention of experienced professionals as
        required.
      </p>
      <p>
        We are happy to share with supporters how their contributions make a difference and to acknowledge their support
        if they wish.
      </p>
      <h4>Sponsor Feature Development</h4>
      <p>
        Sponsoring the development of a new feature or custom OP App is a great way to provide the perfect tailored
        experience for your special user while also giving back to the community.
      </p>
      <p>
        OP Apps can be for education, entertainment, communication, and more. We&apos;re excited to hear your ideas!
      </p>
      <h4>Commission a Custom Solution</h4>
      <p>
        Professional design &amp; development services are offered to individuals and organizations in need of a custom
        designed solution for a particular user, group of users, or for special use-cases.
      </p>
      <p>We can create everything from custom OP Apps to a bespoke platform that suits your needs.</p>
      <p>
        We kindly ask for flexibility in supporting our initiative and allowing some or all work from your custom
        project to be incorporated into the community project and its open-source codebase.
      </p>
      <h4>Commercial Inquiries</h4>
      <p>
        Commercial inquiries are welcome where they are in-line with our principles and compatible with the open-source
        philosophy of the project.
      </p>
      <p>
        We are excited to provide professional support to any individuals or groups aiming to improve on the current
        state of accessible technologies and/or develop a new product or service and bring it to market.
      </p>
    </PageLayout.Prose>
  )
}

export default DonatePage
