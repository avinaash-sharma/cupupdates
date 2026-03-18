import { Article } from '../types';

// export const mockNews: Article[] = [
//   // ── Technology (5) ──────────────────────────────────────────────────────────
//   {
//     id: 'tech-1',
//     title: 'Apple Unveils Revolutionary AI Chip for iPhone 17',
//     summary:
//       'Apple has announced its next-generation neural processing chip that promises 3× faster AI inference, enabling real-time language translation and advanced photography features directly on-device without cloud connectivity.',
//     category: 'Technology',
//     imageUrl: 'https://picsum.photos/seed/tech1/800/1200',
//     url: 'https://example.com/tech/apple-ai-chip',
//     source: 'Tech Chronicle',
//     publishedAt: '2026-03-18T08:00:00Z',
//   },
//   {
//     id: 'tech-2',
//     title: 'Google DeepMind Achieves Breakthrough in Protein Structure Prediction',
//     summary:
//       'Researchers at Google DeepMind released AlphaFold 3, which predicts protein-drug interactions with 94% accuracy, potentially revolutionising pharmaceutical drug discovery and cutting development timelines from years to weeks.',
//     category: 'Technology',
//     imageUrl: 'https://picsum.photos/seed/tech2/800/1200',
//     url: 'https://example.com/tech/deepmind-protein',
//     source: 'Science Daily',
//     publishedAt: '2026-03-17T10:30:00Z',
//   },
//   {
//     id: 'tech-3',
//     title: 'SpaceX Starship Completes First Commercial Lunar Mission',
//     summary:
//       'SpaceX Starship successfully delivered commercial cargo to lunar orbit for three different space agencies, marking a new era in affordable deep-space transportation with a reusable superheavy-lift rocket.',
//     category: 'Technology',
//     imageUrl: 'https://picsum.photos/seed/tech3/800/1200',
//     url: 'https://example.com/tech/spacex-lunar',
//     source: 'Space News',
//     publishedAt: '2026-03-16T14:00:00Z',
//   },
//   {
//     id: 'tech-4',
//     title: 'Meta Launches Holographic AR Glasses for Consumers',
//     summary:
//       'Meta has officially launched Ray-Ban Holographic smart glasses at $1,299, featuring true augmented-reality overlays, 8-hour battery life, and seamless integration with the Meta AI assistant for hands-free productivity.',
//     category: 'Technology',
//     imageUrl: 'https://picsum.photos/seed/tech4/800/1200',
//     url: 'https://example.com/tech/meta-ar-glasses',
//     source: 'Gadget Review',
//     publishedAt: '2026-03-15T09:00:00Z',
//   },
//   {
//     id: 'tech-5',
//     title: "OpenAI GPT-5 Passes Bar Exam With Perfect Score",
//     summary:
//       "OpenAI's GPT-5 achieved a perfect score on the Uniform Bar Examination, outperforming 99.9% of human test-takers. The model also cleared medical board and CPA exams in the same evaluation cycle.",
//     category: 'Technology',
//     imageUrl: 'https://picsum.photos/seed/tech5/800/1200',
//     url: 'https://example.com/tech/gpt5-bar-exam',
//     source: 'AI Weekly',
//     publishedAt: '2026-03-14T16:00:00Z',
//   },

//   // ── Sports (5) ──────────────────────────────────────────────────────────────
//   {
//     id: 'sports-1',
//     title: 'India Wins Cricket World Cup in Historic Final',
//     summary:
//       'India clinched the ICC Cricket World Cup with a thrilling 8-run victory over Australia at the MCG. Virat Kohli scored a century while Jasprit Bumrah took five wickets to seal an unforgettable triumph.',
//     category: 'Sports',
//     imageUrl: 'https://picsum.photos/seed/sports1/800/1200',
//     url: 'https://example.com/sports/india-wc-2026',
//     source: 'Cricket World',
//     publishedAt: '2026-03-18T06:00:00Z',
//   },
//   {
//     id: 'sports-2',
//     title: 'LeBron James Announces Retirement After 22 NBA Seasons',
//     summary:
//       'NBA legend LeBron James officially retired at 41, capping a 22-year career with 4 championships, 4 MVPs, and the all-time scoring record. He is widely considered the greatest player in league history.',
//     category: 'Sports',
//     imageUrl: 'https://picsum.photos/seed/sports2/800/1200',
//     url: 'https://example.com/sports/lebron-retirement',
//     source: 'Sports Center',
//     publishedAt: '2026-03-17T12:00:00Z',
//   },
//   {
//     id: 'sports-3',
//     title: 'Novak Djokovic Claims 25th Grand Slam Title at French Open',
//     summary:
//       'Novak Djokovic overcame a five-set epic against Carlos Alcaraz at Roland Garros to claim his unprecedented 25th Grand Slam, cementing his legacy as the greatest tennis player of all time at age 38.',
//     category: 'Sports',
//     imageUrl: 'https://picsum.photos/seed/sports3/800/1200',
//     url: 'https://example.com/sports/djokovic-25th-slam',
//     source: 'Tennis World',
//     publishedAt: '2026-03-16T18:00:00Z',
//   },
//   {
//     id: 'sports-4',
//     title: 'Real Madrid Sign Erling Haaland in Record €350M Deal',
//     summary:
//       'Real Madrid completed the signing of Erling Haaland from Manchester City in a world-record €350 million transfer. The Norwegian striker signed a six-year deal and will wear the iconic number 9 shirt.',
//     category: 'Sports',
//     imageUrl: 'https://picsum.photos/seed/sports4/800/1200',
//     url: 'https://example.com/sports/haaland-real-madrid',
//     source: 'Football Daily',
//     publishedAt: '2026-03-15T15:00:00Z',
//   },
//   {
//     id: 'sports-5',
//     title: 'Neeraj Chopra Breaks World Record in Javelin at World Athletics',
//     summary:
//       "India's Olympic champion Neeraj Chopra shattered the javelin world record with a stunning 96.34 m effort at the World Athletics Championships, surpassing the previous record by over a metre to claim gold.",
//     category: 'Sports',
//     imageUrl: 'https://picsum.photos/seed/sports5/800/1200',
//     url: 'https://example.com/sports/neeraj-world-record',
//     source: 'Athletics Weekly',
//     publishedAt: '2026-03-14T20:00:00Z',
//   },

//   // ── Business (5) ────────────────────────────────────────────────────────────
//   {
//     id: 'biz-1',
//     title: 'Reliance Industries Becomes First Asian Company Worth $500 Billion',
//     summary:
//       "Reliance Industries crossed the $500 billion market-cap milestone, becoming the first Asian company to reach this valuation. Digital and retail businesses drove growth alongside its traditional energy division.",
//     category: 'Business',
//     imageUrl: 'https://picsum.photos/seed/biz1/800/1200',
//     url: 'https://example.com/business/reliance-500b',
//     source: 'Business Standard',
//     publishedAt: '2026-03-18T07:00:00Z',
//   },
//   {
//     id: 'biz-2',
//     title: 'Fed Cuts Interest Rates to 3.5% Amid Economic Slowdown',
//     summary:
//       'The Federal Reserve cut rates by 50 basis points to 3.5%, the largest single cut in two years, citing slowing growth and falling inflation. The S&P 500 rallied 2.3% following the announcement.',
//     category: 'Business',
//     imageUrl: 'https://picsum.photos/seed/biz2/800/1200',
//     url: 'https://example.com/business/fed-rate-cut',
//     source: 'Financial Times',
//     publishedAt: '2026-03-17T16:00:00Z',
//   },
//   {
//     id: 'biz-3',
//     title: "Tesla Overtakes Toyota as World's Most Valuable Automaker",
//     summary:
//       "Tesla's market cap surged past Toyota to $1.2 trillion following record-breaking Q1 deliveries of 650,000 vehicles, driven by strong demand for the refreshed Model Y and the new entry-level Model 2.",
//     category: 'Business',
//     imageUrl: 'https://picsum.photos/seed/biz3/800/1200',
//     url: 'https://example.com/business/tesla-overtakes-toyota',
//     source: 'Market Watch',
//     publishedAt: '2026-03-16T11:00:00Z',
//   },
//   {
//     id: 'biz-4',
//     title: "Amazon Acquires Retail Chain for $12 Billion to Expand Physical Stores",
//     summary:
//       "Amazon acquired Kohl's department stores for $12 billion, gaining 1,100 physical retail locations across the US. The deal marks Amazon's biggest brick-and-mortar push since its Whole Foods acquisition.",
//     category: 'Business',
//     imageUrl: 'https://picsum.photos/seed/biz4/800/1200',
//     url: 'https://example.com/business/amazon-kohls',
//     source: 'Reuters',
//     publishedAt: '2026-03-15T13:00:00Z',
//   },
//   {
//     id: 'biz-5',
//     title: "India's GDP Growth Hits 8.5% Making It World's Fastest Growing Economy",
//     summary:
//       "India recorded 8.5% GDP growth in Q4 2025, outpacing China's 5.2% and becoming the world's fastest growing major economy for a third consecutive year. Manufacturing and services sectors led the expansion.",
//     category: 'Business',
//     imageUrl: 'https://picsum.photos/seed/biz5/800/1200',
//     url: 'https://example.com/business/india-gdp-2026',
//     source: 'Economic Times',
//     publishedAt: '2026-03-14T09:00:00Z',
//   },

//   // ── Entertainment (5) ───────────────────────────────────────────────────────
//   {
//     id: 'ent-1',
//     title: "Christopher Nolan's New Epic Wins 8 Oscars Including Best Picture",
//     summary:
//       'Christopher Nolan swept the Academy Awards with 8 wins including Best Picture and Best Director for his latest sci-fi masterpiece, which grossed over $2.5 billion worldwide in its opening month.',
//     category: 'Entertainment',
//     imageUrl: 'https://picsum.photos/seed/ent1/800/1200',
//     url: 'https://example.com/entertainment/oscars-2026',
//     source: 'Hollywood Reporter',
//     publishedAt: '2026-03-18T05:00:00Z',
//   },
//   {
//     id: 'ent-2',
//     title: 'Taylor Swift Breaks Streaming Record with 1 Billion Day-One Streams',
//     summary:
//       "Taylor Swift's new album shattered all streaming records with 1.2 billion streams on its first day of release across all platforms. The album features 31 songs and collaborations with six different artists.",
//     category: 'Entertainment',
//     imageUrl: 'https://picsum.photos/seed/ent2/800/1200',
//     url: 'https://example.com/entertainment/taylor-swift-record',
//     source: 'Billboard',
//     publishedAt: '2026-03-17T08:00:00Z',
//   },
//   {
//     id: 'ent-3',
//     title: 'Netflix Confirms Squid Game Season 3 With Original Cast Returning',
//     summary:
//       'Netflix confirmed Squid Game Season 3 will feature the complete return of the original cast. Production begins in April with a $100M budget and an expected December 2026 worldwide release.',
//     category: 'Entertainment',
//     imageUrl: 'https://picsum.photos/seed/ent3/800/1200',
//     url: 'https://example.com/entertainment/squid-game-s3',
//     source: 'Variety',
//     publishedAt: '2026-03-16T10:00:00Z',
//   },
//   {
//     id: 'ent-4',
//     title: "Bollywood Film 'Dunki 2' Sets All-Time Global Box Office Record",
//     summary:
//       "Shah Rukh Khan's Dunki 2 crossed $1 billion globally in just 12 days, setting an all-time Bollywood record. Directed by Rajkumar Hirani, the film has been praised for its powerful emotional storytelling.",
//     category: 'Entertainment',
//     imageUrl: 'https://picsum.photos/seed/ent4/800/1200',
//     url: 'https://example.com/entertainment/dunki-2-boxoffice',
//     source: 'Film Companion',
//     publishedAt: '2026-03-15T14:00:00Z',
//   },
//   {
//     id: 'ent-5',
//     title: 'The Beatles AI Album Debuts at Number One in 42 Countries',
//     summary:
//       'A new album featuring AI-reconstructed Beatles songs with restored vocals debuted at number one in 42 countries simultaneously. The project was approved by surviving members and uses breakthrough audio-restoration AI.',
//     category: 'Entertainment',
//     imageUrl: 'https://picsum.photos/seed/ent5/800/1200',
//     url: 'https://example.com/entertainment/beatles-ai-album',
//     source: 'Rolling Stone',
//     publishedAt: '2026-03-14T12:00:00Z',
//   },
// ];
