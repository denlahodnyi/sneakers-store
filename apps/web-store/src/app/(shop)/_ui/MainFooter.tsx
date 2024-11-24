import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

import { ContentContainer } from '~/shared/ui';

function MainFooter() {
  return (
    <footer className="bg-footer">
      <ContentContainer className="grid gap-7 sm:grid-cols-[repeat(3,minmax(min-content,300px))] sm:justify-center sm:gap-4">
        <section>
          <h2 className="mb-3 text-lg font-bold">Company</h2>
          <ul className="space-y-2">
            <li>
              <Link href="#">About us</Link>
            </li>
            <li>
              <Link href="#">Stores</Link>
            </li>
            <li>
              <Link href="#">Contacts</Link>
            </li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold">Support</h2>
          <ul className="space-y-2">
            <li>
              <Link href="#">Help</Link>
            </li>
            <li>
              <Link href="#">Delivery</Link>
            </li>
            <li>
              <Link href="#">Returns & refunds</Link>
            </li>
          </ul>
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold">Contacts</h2>
          <ul className="space-y-2">
            <li>
              <span>+111 1111 1111</span>
            </li>
            <li>
              <ul className="flex space-x-3 text-zinc-500">
                <li>
                  <a href="#">
                    <FaFacebook />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaInstagram />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaTwitter />
                  </a>
                </li>
                <li>
                  <a href="#">
                    <FaYoutube />
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </section>
      </ContentContainer>
    </footer>
  );
}

export default MainFooter;
