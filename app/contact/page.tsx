import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact SANAÉRA",
  description: "Send a message to the SANAÉRA customer care team.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="min-h-[70vh] px-6 pb-24 pt-32 outline-none md:px-12">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.18em] text-champagne">Customer care</p>
            <h1 className="mb-6 font-display text-4xl text-warmwhite md:text-5xl">How may we help?</h1>
            <p className="max-w-md text-sm leading-7 text-sand">
              Send us a note about a piece, an order, or a styling appointment. Our team will follow up using the email address you provide.
            </p>
          </div>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  );
}