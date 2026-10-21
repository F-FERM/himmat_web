import Image from "next/image";
import Client1 from "../../public/images/clients/client1.jpg"
import Client2 from "../../public/images/clients/client2.jpg"
import Client3 from "../../public/images/clients/client3.jpg"
import Client4 from "../../public/images/clients/client4.jpg"
import Client5 from "../../public/images/clients/client5.jpg"
import Client6 from "../../public/images/clients/client6.jpg"
import Client7 from "../../public/images/clients/client7.jpg"
import Client8 from "../../public/images/clients/client8.jpg"
import Client9 from "../../public/images/clients/client9.jpg"
import Client10 from "../../public/images/clients/client10.jpg"
import Client11 from "../../public/images/clients/client11.jpg"
import Client12 from "../../public/images/clients/client12.jpg"
import Client13 from "../../public/images/clients/client13.jpg"
import Client14 from "../../public/images/clients/client14.jpg"
import Client15 from "../../public/images/clients/client15.jpg"
import Client16 from "../../public/images/clients/client16.jpg"
import Client17 from "../../public/images/clients/client17.jpg"
import Client18 from "../../public/images/clients/client18.jpg"
import Client19 from "../../public/images/clients/client19.jpg"
import Client20 from "../../public/images/clients/client20.jpg"

// Put the logo files in /public/images/clients/ (png, svg, webp... just keep the extension in sync here)
const CLIENTS = [
  { name: "Aramco", src: Client1 },
  { name: "SABIC", src: Client2 },
  { name: "Saline Water Conversion Corporation", src: Client3 },
  { name: "Marafiq", src: Client4 },
  { name: "BFIM Trading Division", src: Client5 },
  { name: "NHME Group", src: Client6 },
  { name: "Saudi Electricity Company", src: Client7 },
  { name: "Kingdom of Saudi Arabia", src: Client8 },
  { name: "Wison", src: Client9 },
  { name: "Red Sea Global", src: Client10 },
  { name: "Doosan", src: Client11 },
  { name: "Hanwha", src: Client12 },
  { name: "Samsung C&T", src: Client13 },
  { name: "SASREF", src: Client14 },
  { name: "SEPCO", src: Client15 },
  { name: "Sinohydro", src: Client16 },
  { name: "Sipchem", src: Client17 },
  { name: "SK E&C", src: Client18 },
  { name: "Tiejun", src: Client19 },
  { name: "Archirodon", src: Client20 },
];

function Clients() {
  return (
    <section className="w-full overflow-x-clip bg-white py-10 sm:py-14 2xl:pb-[89px] 2xl:pt-[70px]">
      <ul
        className="grid grid-cols-2 gap-3 px-5
                   sm:grid-cols-3 sm:gap-4 sm:px-8
                   lg:grid-cols-4 lg:gap-5 lg:px-12
                   xl:grid-cols-6 xl:gap-x-5 xl:gap-y-5 xl:px-[8%]
                   2xl:ml-[15%] 2xl:mr-[14.9%] 2xl:gap-x-[1.87%] 2xl:px-0"
      >
        {CLIENTS.map((client) => (
          <li
            key={client.name}
            className="relative aspect-[203/107] bg-[#FDFDFD] shadow-[0_0_30px_rgba(0,0,0,0.06)]"
          >
            {/* Logo (image), kept inside the card with some breathing room */}
            <div className="absolute inset-0 p-4 sm:p-5 2xl:p-[10%]">
              <div className="relative h-full w-full">
                <Image
                  src={client.src}
                  alt={client.name}
                  fill
                  sizes="(min-width: 1280px) 15vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 45vw"
                  className="object-contain"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Clients;