import React from "react";
import { motion } from "framer-motion";
import { Library } from "lucide-react";

export default function Curiosities() {
  const curiosities = [
    {
      title: "El libro más antiguo del mundo",
      content:
        "Se considera que la 'Epopeya de Gilgamesh' es la obra literaria más antigua conocida de la humanidad, escrita en tablillas de arcilla alrededor del 2100 a.C.",
      category: "Historia Antigua",
    },
    {
      title: "El síndrome de Tsundoku",
      content:
        "Es la palabra japonesa para la costumbre de adquirir materiales de lectura que se apilan en el hogar sin ser leídos. Muchos ávidos lectores lo padecen.",
      category: "Psicología",
    },
    {
      title: "El olor a libro viejo",
      content:
        "Ese aroma característico que muchas personas disfrutan proviene de la degradación de los compuestos químicos del papel, como la lignina, que emite un sutil olor similar a la vainilla.",
      category: "Ciencia",
    },
    {
      title: "La primera novela",
      content:
        "'La historia de Genji', escrita por Murasaki Shikibu a principios del siglo XI, es a menudo considerada como la primera novela de la historia.",
      category: "Literatura",
    },
  ];

  return (
    <div className="flex flex-col gap-12 max-w-5xl mx-auto">
      <div className="border-b-[3px] border-foreground pb-6 text-center flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tighter mb-4">
          Curiosidades Literarias
        </h1>
        <p className="font-serif italic text-muted-foreground max-w-2xl text-lg">
          Datos fascinantes, anécdotas históricas y notas marginales sobre el
          vasto mundo de los libros.
        </p>
      </div>

      <div className="columns-1 md:columns-2 gap-8 space-y-8">
        {curiosities.map((item, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="break-inside-avoid border border-border p-8 bg-card shadow-sm hover:shadow-md transition-shadow relative"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/20"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3 block">
              {item.category}
            </span>
            <h3 className="font-serif font-bold text-2xl mb-4 leading-snug">
              {item.title}
            </h3>
            <p className="font-serif text-muted-foreground text-lg leading-relaxed mix-blend-multiply">
              {item.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-muted/40 p-12 border border-border text-center flex flex-col items-center">
        <Library className="w-12 h-12 text-primary mb-6 opacity-80" />
        <h3 className="font-heading font-bold text-2xl mb-4">
          ¿Tienes un dato interesante?
        </h3>
        <p className="text-lg font-serif text-muted-foreground mb-8 max-w-xl">
          Nuestros archivos crecen con las aportaciones de nuestros lectores.
          Envíanos material curioso para añadir a esta sección.
        </p>
        <button className="bg-foreground text-background font-bold uppercase text-xs tracking-widest px-8 py-4 hover:bg-primary transition-colors">
          Contactar al Editor
        </button>
      </div>
    </div>
  );
}
