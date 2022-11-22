import type { NextPage } from 'next'
import React from 'react'
import { PageLayout } from '../components/layout/PageLayout'

/**
 * About page.
 */
export const AboutPage: NextPage = (_props) => {
  return (
    <PageLayout.Prose
      heading={
        <>
          About Olivia<span className="italic">Party</span>
        </>
      }
      subheading="About Us"
    >
      <blockquote>
        Our goal is to democratize the ability to create effective and affordable accessibility solutions for those with
        disabilities and special needs.
      </blockquote>
      <p>
        OliviaParty started as a DIY side-project for Olivia, a special young girl with requirements that go beyond the
        design scope of commercial accessibility aids.
      </p>
      <p>
        This project and website was launched in October 2022 to share Olivia&apos;s gift with the world: a proven
        foundation and set of &ldquo;recipes&rdquo; to create smart, connected accessibility solutions from affordable
        off-the-shelf technology.
      </p>

      <p>OliviaParty is released for free under the Apache 2.0 open-source license.</p>

      <h3>Our Team</h3>
      <p>
        This project is the work of Kevin Firko, a web developer based in Toronto, Canada, with the support and input of
        Olivia and her incredible mother Izabella.
      </p>
      <p>
        Get in touch with us if you&apos;d like to support or donate to this project, sponsor new features, commission a
        custom hardware design, or discuss commercial opportunities that are in-line with our principles.
      </p>
      <p>
        We&apos;d love to work on this full-time. We are connected to a pool of talented developers, technologists,
        creatives, and makers that can meet your goals.
      </p>
      <h3>The Need for Accessible Accessibility</h3>
      <p>
        There are a lot of people in the world like Olivia and many more who are doing their best to care for people
        like her.
      </p>
      <p>
        The world&apos;s elderly population is increasing and across all causes the population of those who become
        temporarily or permanently disabled grows larger every day.
      </p>
      <p>
        Conflict zones across the world are responsible for contributing a frightening number of newly disabled
        individuals including large numbers of innocent civilians and noncombatants.
      </p>
      <h4>State of the Industry</h4>
      <p>
        Despite the need, the current market for commercial accessibility solutions is extremely limited and devices are
        generally very expensive.
      </p>
      <p>Even the most basic options are often kept proprietary and closed to customization or innovation.</p>
      <p>
        If a user or their caregivers don&apos;t fit into a set of assumptions regarding their physical and/or cognitive
        abilities, or they simply don&apos;t have the resources, they are often left without options.
      </p>
      <p>
        At the same time, commodity electronic components &mdash; things like buttons, joysticks for forklifts, etc.
        &mdash; are routinely relabeled as &ldquo;accessible&rdquo; and exploitatively marked up several hundred to
        several thousand percent.
      </p>
      <p>
        There are sadly abundant examples of $0.50 components being sold for hundreds of dollars USD with near-zero to
        zero innovation or value added.
      </p>
      <h4>Positive Change</h4>
      <p>
        It would delight us to see others use OliviaParty as a jump-start to creating new accessibility solutions
        &mdash; both free and commercial &mdash; to serve this massive unmet and growing need.
      </p>

      <h3>History: Our First Prototype</h3>
      <p>
        The first end-to-end &ldquo;thing&rdquo; we built was a specially designed and positioned controller that Olivia
        could use to cycle between her favourite cartoons on a display.
      </p>
      <p>
        The device enabled Olivia to meaningfully &mdash; with <em>intent</em> &mdash; control a device in the physical
        world for the first time.
      </p>
      <p>
        It was able to succeed where specialists and expensive devices could not because it was built to accommodate{' '}
        <em>her</em> specific physical and cognitive limitations and it was crafted to capture <em>her</em> attention
        and appeal to <em>her</em> specific interests.
      </p>
      <p>
        The prototype helped open the door to a new personal relationship with technology and a deeper understanding
        that many <em>things</em> can be <em>controlled</em>.
      </p>
      <h3>OliviaParty Launch</h3>
      <p>
        The public launch of OliviaParty expands the scope of the project beyond a single target user. It introduces a
        web-based player that anyone can access and a control panel for caregivers to manage &ldquo;apps&rdquo; like the
        Video Player for their users.
      </p>
      <p>
        Modern browsers and devices have 3D, accelerometer + gyroscope, text-to-speech, speech-to-text, video,
        microphone, etc access and they can interface with hardware like joysticks. Microcontrollers with WiFi and
        Bluetooth cost only a few dollars.
      </p>
      <p>The project is self-funded and our roadmap is limited only by resources.</p>
      <p>
        Please consider supporting our project if you&apos;d like to see more innovation in accessibility released for
        free under the Apache 2.0 license.
      </p>
    </PageLayout.Prose>
  )
}

export default AboutPage
