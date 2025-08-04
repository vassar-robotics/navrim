import React from 'react'
import PageLayout from '@/components/layout/page-layout'

const PrivacyPolicyPage: React.FC = () => {
  return (
    <PageLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="space-y-8">
            {/* Introduction */}
            <section className="space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </p>
              <p className="leading-relaxed text-muted-foreground">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                laborum.
              </p>
            </section>

            {/* Section 1: Information We Collect */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris:
              </p>

              <h3 className="text-xl font-medium">1.1 Personal Information</h3>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Lorem ipsum dolor sit amet</li>
                <li>Consectetur adipiscing elit sed do</li>
                <li>Eiusmod tempor incididunt ut</li>
                <li>Labore et dolore magna aliqua</li>
                <li>Ut enim ad minim veniam quis</li>
              </ul>

              <h3 className="text-xl font-medium">1.2 Data You Upload</h3>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Nostrud exercitation ullamco laboris</li>
                <li>Nisi ut aliquip ex ea commodo</li>
                <li>Consequat duis aute irure dolor</li>
                <li>Reprehenderit in voluptate velit</li>
              </ul>

              <h3 className="text-xl font-medium">1.3 Automatically Collected Information</h3>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Esse cillum dolore eu fugiat nulla</li>
                <li>Pariatur excepteur sint occaecat</li>
                <li>Cupidatat non proident sunt in</li>
                <li>Culpa qui officia deserunt mollit</li>
              </ul>
            </section>

            {/* Section 2: How We Use Your Information */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
              <p className="leading-relaxed text-muted-foreground">Lorem ipsum dolor sit amet consectetur:</p>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Anim id est laborum sed do eiusmod</li>
                <li>Tempor incididunt ut labore et dolore</li>
                <li>Magna aliqua ut enim ad minim veniam</li>
                <li>Quis nostrud exercitation ullamco</li>
                <li>Laboris nisi ut aliquip ex ea</li>
                <li>Commodo consequat duis aute irure</li>
                <li>Dolor in reprehenderit in voluptate</li>
                <li>Velit esse cillum dolore eu fugiat</li>
              </ul>
            </section>

            {/* Section 3: Data Processing for AI */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">3. Data Processing for AI Training</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Nulla pariatur excepteur sint occaecat cupidatat</li>
                <li>Non proident sunt in culpa qui officia</li>
                <li>Deserunt mollit anim id est laborum</li>
                <li>Sed ut perspiciatis unde omnis iste natus</li>
                <li>Error sit voluptatem accusantium doloremque</li>
                <li>Laudantium totam rem aperiam eaque ipsa</li>
              </ul>
            </section>

            {/* Section 4: Data Sharing */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">4. Information Sharing and Disclosure</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud
                exercitation ullamco laboris nisi ut aliquip:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Quae ab illo inventore veritatis et quasi</li>
                <li>Architecto beatae vitae dicta sunt explicabo</li>
                <li>Nemo enim ipsam voluptatem quia voluptas sit</li>
                <li>Aspernatur aut odit aut fugit sed quia</li>
                <li>Consequuntur magni dolores eos qui ratione</li>
              </ul>
            </section>

            {/* Section 5: Data Security */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">5. Data Security</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Voluptatem sequi nesciunt neque porro</li>
                <li>Quisquam est qui dolorem ipsum quia dolor</li>
                <li>Sit amet consectetur adipisci velit</li>
                <li>Sed quia non numquam eius modi tempora</li>
                <li>Incidunt ut labore et dolore magnam</li>
                <li>Aliquam quaerat voluptatem ut enim</li>
              </ul>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in
                voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </section>

            {/* Section 6: Data Retention */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">6. Data Retention</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam libero tempore, cum soluta nobis est
                eligendi optio cumque nihil impedit quo minus:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Id quod maxime placeat facere possimus</li>
                <li>Omnis voluptas assumenda est omnis dolor</li>
                <li>Repellendus temporibus autem quibusdam</li>
                <li>Et aut officiis debitis aut rerum necessitatibus</li>
              </ul>
            </section>

            {/* Section 7: Your Rights */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">7. Your Rights and Choices</h2>
              <p className="leading-relaxed text-muted-foreground">Lorem ipsum dolor sit amet:</p>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Saepe eveniet ut et voluptates repudiandae</li>
                <li>Sint et molestiae non recusandae</li>
                <li>Ut aut reiciendis voluptatibus maiores</li>
                <li>Alias consequatur aut perferendis doloribus</li>
                <li>Asperiores repellat nam libero tempore</li>
                <li>Cum soluta nobis est eligendi optio</li>
                <li>Cumque nihil impedit quo minus id</li>
              </ul>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.
              </p>
            </section>

            {/* Section 8: Cookies */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">8. Cookies and Tracking Technologies</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit:
              </p>
              <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
                <li>Quod maxime placeat facere possimus</li>
                <li>Omnis dolor repellendus temporibus</li>
                <li>Autem quibusdam et aut officiis</li>
                <li>Debitis aut rerum necessitatibus saepe</li>
              </ul>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minima veniam, quis nostrum
                exercitationem ullam corporis suscipit laboriosam.
              </p>
            </section>

            {/* Section 9: International Data Transfers */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">9. International Data Transfers</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore. Et
                dolore magna aliqua ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat duis aute irure dolor.
              </p>
            </section>

            {/* Section 10: Children's Privacy */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">10. Children's Privacy</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nisi ut aliquid ex ea commodi consequatur? Quis
                autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel
                illum qui dolorem eum fugiat quo voluptas nulla pariatur.
              </p>
            </section>

            {/* Section 11: Third-Party Links */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">11. Third-Party Links and Services</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. At vero eos et accusamus et iusto odio
                dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas
                molestias excepturi sint occaecati cupiditate.
              </p>
            </section>

            {/* Section 12: Changes to Privacy Policy */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">12. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Non provident, similique sunt in culpa qui
                officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et
                expedita distinctio nam libero tempore.
              </p>
            </section>

            {/* Section 13: Contact Us */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">13. Contact Us</h2>
              <p className="leading-relaxed text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor:
              </p>
              <div className="ml-6 space-y-1 text-muted-foreground">
                <p>Lorem: ipsum@dolor.com</p>
                <p>Consectetur: [Lorem Ipsum Dolor Sit Amet]</p>
                <p>Adipiscing Elit: sed@eiusmod.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

export default PrivacyPolicyPage
