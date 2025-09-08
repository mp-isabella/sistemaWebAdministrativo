export const useSmoothScroll = () => {
  const scrollToSection = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      const topOffset = 80; // Ajusta esto según el alto de tu barra superior
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return { scrollToSection };
};
