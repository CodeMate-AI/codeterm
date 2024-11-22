import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";

// Define the type for the product tab item
interface Product {
  title: string;
  imageSrc: string;
  installText: string;
  actionLinks: {
    install: string;
    marketplace?: string;
    viewDocumentation: string;
  };
  isWeb: boolean;
  description?: string;
}

interface ProductTabProps {
  products: Product[];
}

interface ElectronAPI {
  openFile: () => Promise<string[]>;
  readFile: (filePath: string) => Promise<string>;
  saveFile: (filePath: string, content: string) => Promise<void>;
  createFile: (
    fileName: string,
    content: string,
    currentDir: string
  ) => Promise<string>;

  openExternalLink: (url: string) => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export const ProductTab: React.FC<ProductTabProps> = ({ products }) => {
  const handleAction = (url: string) => {
    // Use the openExternalLink method exposed by Electron
    window.electron
      .openExternalLink(url)
      .then((response) => {
        console.log("URL opened successfully:", response);
      })
      .catch((error) => {
        console.error("Error opening URL:", error);
      });
  };

  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar text-[--textColor]">
      {products.map((product, index) => (
        <div
          key={index}
          className="bg-[--bgColor] border border-[--borderColor] rounded-lg p-4 mb-4"
        >
          <div className="flex items-center mb-4">
            <img
              src={product.imageSrc}
              alt={product.title}
              className="mr-2 h-6"
            />
            <div className="flex items-center justify-center">
              <span className="custom-font-size mt-1">{product.title}</span>
            </div>
          </div>

          <button
            onClick={() => handleAction(product.actionLinks.install)}
            className="bg-[--darkBlueColorGradientStart] text-[--textColor] py-2 px-4 rounded-md mb-3 hover:bg-[--darkBlueColorGradientEnd] transition-colors custom-font-size"
          >
            {product.installText}
          </button>

          <div className="custom-font-size text-[--textColor]">
            {!product.isWeb && (
              <>
                {product?.actionLinks?.marketplace && (
                  <button
                    onClick={() =>
                      handleAction(product.actionLinks.marketplace)
                    }
                    className="flex items-center hover:text-[--lightGrayColor] transition-colors mb-1 custom-font-size"
                  >
                    <span>View in VS Code Marketplace</span>
                    <FaExternalLinkAlt className="ml-1 w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={() =>
                    handleAction(product.actionLinks.viewDocumentation)
                  }
                  className="flex items-center hover:text-[--lightGrayColor] transition-colors custom-font-size"
                >
                  <span>View in Documentation</span>
                  <FaExternalLinkAlt className="ml-1 w-3 h-3" />
                </button>
              </>
            )}
            {product.description && (
              <span className="custom-font-size text-[--textColor]">
                {product.description}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Example usage of the ProductTab component
