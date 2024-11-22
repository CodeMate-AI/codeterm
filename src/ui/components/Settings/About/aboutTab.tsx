import codemateLogoDarkImage from "../../../../assets/codemateLogoDark.svg";
import codemateLogoLightImage from "../../../../assets/codemateLogoLight.svg";

export function AboutTab() {
  const getTheme = localStorage.getItem("theme");

  let logoImage;

  if (getTheme === "codemate-ai-light") {
    logoImage = codemateLogoDarkImage;
  } else {
    logoImage = codemateLogoLightImage;
  }

  return (
    <div className="overflow-y-auto w-3/4 p-4 max-h-[552px] hide-scrollbar text-[--textColor]">
      <div className="flex items-center justify-center h-full">
        <div>
          <img src={logoImage} alt="codemate.ai-logo" className="mb-3 h-20" />
          <p className="text-[--textColor] custom-font-size flex justify-center mb-2">
            v0.0.1
          </p>
          <p className="text-[--textColor] custom-font-size flex justify-center">
            Copyright 2024 Codemate.ai
          </p>
        </div>
      </div>
    </div>
  );
}
