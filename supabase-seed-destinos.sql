-- Seed de destinos curados para a aba "Para você" e cobertura por continente.
-- Rodar uma vez, depois de supabase-schema.sql, no SQL Editor do Supabase.
-- continente usa os mesmos valores em inglês do dataset world-countries
-- (Europe, Asia, Africa, Americas, Oceania) para casar com paises-data.json.

insert into public.destinos (codigo_pais, nome_pais, cidade, continente, tags, descricao, melhor_epoca) values
('PT', 'Portugal', 'Lisboa', 'Europe', '{urbano,cultura,gastronomia}', 'Bairros históricos, fado e pastéis de nata à beira do Tejo', 'março–maio'),
('FR', 'França', 'Paris', 'Europe', '{urbano,cultura,historia}', 'Museus, arquitetura e a Torre Eiffel', 'abril–junho'),
('IT', 'Itália', 'Roma', 'Europe', '{historia,cultura,gastronomia}', 'Ruínas romanas, arte renascentista e culinária', 'abril–outubro'),
('GR', 'Grécia', 'Santorini', 'Europe', '{praia,natureza,gastronomia}', 'Vilarejos brancos sobre falésias e pôr do sol no Egeu', 'maio–setembro'),
('ES', 'Espanha', 'Barcelona', 'Europe', '{urbano,cultura,praia}', 'Arquitetura de Gaudí e praias no Mediterrâneo', 'maio–setembro'),
('IS', 'Islândia', 'Reykjavík', 'Europe', '{natureza,aventura}', 'Vulcões, geleiras e auroras boreais', 'jun–ago / set–mar'),
('CH', 'Suíça', 'Zermatt', 'Europe', '{montanha,natureza,aventura}', 'Trilhas alpinas aos pés do Matterhorn', 'junho–setembro'),
('NO', 'Noruega', 'Bergen', 'Europe', '{natureza,montanha,aventura}', 'Fiordes espetaculares e trilhas costeiras', 'maio–setembro'),
('JP', 'Japão', 'Kyoto', 'Asia', '{cultura,historia,natureza}', 'Templos milenares e jardins tradicionais', 'mar–mai / out–nov'),
('TH', 'Tailândia', 'Phuket', 'Asia', '{praia,aventura,gastronomia}', 'Praias tropicais e culinária de rua', 'novembro–fevereiro'),
('VN', 'Vietnã', 'Ha Long Bay', 'Asia', '{natureza,aventura}', 'Baía com milhares de ilhotas calcárias', 'outubro–abril'),
('ID', 'Indonésia', 'Bali', 'Asia', '{praia,natureza,cultura}', 'Templos, arrozais e praias de surf', 'abril–outubro'),
('NP', 'Nepal', 'Kathmandu', 'Asia', '{montanha,aventura,cultura}', 'Portal do Himalaia e trekking histórico', 'out–nov / mar–abr'),
('IN', 'Índia', 'Jaipur', 'Asia', '{historia,cultura,gastronomia}', 'Cidade Rosa com fortes e palácios', 'outubro–março'),
('AE', 'Emirados Árabes', 'Dubai', 'Asia', '{urbano,aventura}', 'Skyline futurista e deserto ao alcance da cidade', 'novembro–março'),
('MA', 'Marrocos', 'Marraquexe', 'Africa', '{cultura,gastronomia,aventura}', 'Souks labirínticos e portas do Saara', 'mar–mai / set–nov'),
('EG', 'Egito', 'Cairo', 'Africa', '{historia,cultura}', 'Pirâmides de Gizé e o Museu Egípcio', 'outubro–abril'),
('ZA', 'África do Sul', 'Cidade do Cabo', 'Africa', '{natureza,aventura,praia}', 'Table Mountain, vinícolas e safáris próximos', 'novembro–março'),
('TZ', 'Tanzânia', 'Serengeti', 'Africa', '{natureza,aventura}', 'Grande Migração e safáris de vida selvagem', 'junho–outubro'),
('KE', 'Quênia', 'Masai Mara', 'Africa', '{natureza,aventura}', 'Savanas e safáris com os povos masai', 'julho–outubro'),
('US', 'Estados Unidos', 'Nova York', 'Americas', '{urbano,cultura}', 'Metrópole cultural, museus e Broadway', 'abr–jun / set–nov'),
('US', 'Estados Unidos', 'Grand Canyon', 'Americas', '{natureza,aventura}', 'Um dos maiores cânions do mundo', 'mar–mai / set–nov'),
('CA', 'Canadá', 'Banff', 'Americas', '{montanha,natureza,aventura}', 'Lagos glaciais e Montanhas Rochosas', 'junho–setembro'),
('PE', 'Peru', 'Machu Picchu', 'Americas', '{historia,montanha,aventura}', 'Cidadela inca nos Andes', 'maio–setembro'),
('AR', 'Argentina', 'El Calafate', 'Americas', '{natureza,aventura,montanha}', 'Geleira Perito Moreno na Patagônia', 'outubro–abril'),
('CL', 'Chile', 'Deserto do Atacama', 'Americas', '{natureza,aventura}', 'Paisagens lunares e céus para observar estrelas', 'o ano todo'),
('MX', 'México', 'Tulum', 'Americas', '{praia,cultura,historia}', 'Ruínas maias à beira-mar e cenotes', 'novembro–abril'),
('AU', 'Austrália', 'Sydney', 'Oceania', '{urbano,praia,natureza}', 'Ópera, praias urbanas e Great Barrier Reef próximo', 'set–nov / mar–mai'),
('NZ', 'Nova Zelândia', 'Queenstown', 'Oceania', '{montanha,natureza,aventura}', 'Capital mundial dos esportes de aventura', 'dezembro–março'),
('PF', 'Polinésia Francesa', 'Bora Bora', 'Oceania', '{praia,natureza}', 'Lagoas turquesa e bangalôs sobre a água', 'maio–outubro');
