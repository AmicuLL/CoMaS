import { Select } from "@mantine/core";
import { useEffect, useState } from "react";
import { IconGlobe } from "@tabler/icons-react";
import i18n from "i18next";

const LanguageSelector = () => {
  const [language, setLanguage] = useState(
    localStorage.getItem("language") || "en"
  );

  const changeLanguage = (lang) => {
    if (!lang) return;
    localStorage.setItem("language", lang);
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <Select
      value={language}
      variant="unstyled"
      size="xs"
      w="109"
      bg="light-dark(rgba(220, 220, 220, 0.2), rgba(255,255,255,0.1))"
      style={{border: "2px solid rgba(0,0,0,0.1)",borderRadius: "15px"}}
      onChange={(val) => val && changeLanguage(val)}
      data={[
        { value: "ro", label: "🇷🇴 Română" },
        { value: "en", label: "🇬🇧 English" },
      ]}
      icon={<IconGlobe size={16} />}
    />
  );
};

export default LanguageSelector;
