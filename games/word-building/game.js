'use strict';

// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================

const CONFIG = {
    totalSets: 5,
    minWordLength: 3,
    lettersPerSet: 8,
};

// Letter sets with vowels and consonants for word building
const LETTER_SETS = [
    ['A', 'T', 'R', 'E', 'S', 'P', 'O', 'N'],  // can make: rat, tar, ate, eat, tear, pear, store, etc.
    ['C', 'A', 'R', 'E', 'D', 'S', 'O', 'T'],  // can make: car, cat, rat, red, dot, toad, etc.
    ['B', 'E', 'A', 'R', 'D', 'S', 'I', 'T'],  // can make: bear, bead, bat, rat, bird, etc.
    ['F', 'I', 'R', 'E', 'S', 'T', 'A', 'N'],  // can make: fire, tire, ran, tan, fast, etc.
    ['M', 'A', 'K', 'E', 'S', 'I', 'T', 'N'],  // can make: make, take, sit, mat, etc.
    ['G', 'O', 'A', 'L', 'S', 'T', 'E', 'N'],  // can make: goat, goal, late, gate, etc.
    ['P', 'L', 'A', 'Y', 'S', 'E', 'D', 'R'],  // can make: play, slay, red, reds, etc.
];

// Comprehensive kid-friendly word dictionary (3-5 letter words)
const VALID_WORDS = new Set([
    // 3-letter words
    'ace', 'act', 'add', 'age', 'ago', 'aid', 'aim', 'air', 'all', 'and', 'ant', 'any', 'ape', 'arc', 'are', 'ark', 'arm', 'art', 'ash', 'ask', 'ate', 'bad', 'bag', 'ban', 'bar', 'bat', 'bay', 'bed', 'bee', 'bet', 'bid', 'big', 'bin', 'bit', 'boa', 'bog', 'bow', 'box', 'boy', 'bud', 'bug', 'bun', 'bus', 'but', 'buy', 'cab', 'cam', 'can', 'cap', 'car', 'cat', 'cod', 'cog', 'cop', 'cot', 'cow', 'cry', 'cub', 'cup', 'cut', 'dad', 'dam', 'day', 'den', 'dew', 'did', 'die', 'dig', 'dim', 'din', 'dip', 'dog', 'dot', 'dry', 'dub', 'dud', 'due', 'dug', 'ear', 'eat', 'ebb', 'eel', 'egg', 'elf', 'elk', 'elm', 'emu', 'end', 'era', 'eve', 'eye', 'fab', 'fad', 'fan', 'far', 'fat', 'fax', 'fed', 'fee', 'fen', 'few', 'fib', 'fig', 'fin', 'fir', 'fit', 'fix', 'fly', 'foe', 'fog', 'for', 'fox', 'fry', 'fun', 'fur', 'gab', 'gag', 'gap', 'gas', 'gel', 'gem', 'get', 'gig', 'gin', 'gnu', 'gob', 'god', 'got', 'gum', 'gun', 'gut', 'guy', 'gym', 'had', 'hag', 'ham', 'has', 'hat', 'hay', 'hem', 'hen', 'her', 'hew', 'hex', 'hey', 'hid', 'him', 'hip', 'his', 'hit', 'hob', 'hog', 'hop', 'hot', 'how', 'hub', 'hue', 'hug', 'hum', 'hut', 'ice', 'icy', 'ill', 'imp', 'ink', 'inn', 'ion', 'its', 'ivy', 'jab', 'jag', 'jam', 'jar', 'jaw', 'jay', 'jet', 'jig', 'job', 'jog', 'jot', 'joy', 'jug', 'keg', 'ken', 'key', 'kid', 'kin', 'kit', 'lab', 'lad', 'lag', 'lap', 'law', 'lax', 'lay', 'lea', 'led', 'leg', 'let', 'lid', 'lie', 'lip', 'lit', 'log', 'lot', 'low', 'lug', 'mac', 'mad', 'mag', 'man', 'map', 'mar', 'mat', 'max', 'may', 'men', 'met', 'mid', 'mix', 'mob', 'mod', 'mom', 'mop', 'mud', 'mug', 'nab', 'nag', 'nap', 'net', 'new', 'nib', 'nip', 'nit', 'nod', 'nor', 'not', 'now', 'nub', 'nun', 'nut', 'oak', 'oar', 'oat', 'odd', 'ode', 'off', 'oft', 'oil', 'old', 'one', 'opt', 'orb', 'ore', 'our', 'out', 'owe', 'owl', 'own', 'pad', 'pal', 'pan', 'par', 'pat', 'paw', 'pay', 'pea', 'peg', 'pen', 'pep', 'per', 'pet', 'pie', 'pig', 'pin', 'pit', 'pod', 'pop', 'pot', 'pry', 'pub', 'pug', 'pun', 'pup', 'put', 'rad', 'rag', 'ram', 'ran', 'rap', 'rat', 'raw', 'ray', 'red', 'rep', 'rev', 'rib', 'rid', 'rig', 'rim', 'rip', 'rob', 'rod', 'roe', 'rot', 'row', 'rub', 'rug', 'rum', 'run', 'rut', 'rye', 'sab', 'sac', 'sad', 'sag', 'sap', 'sat', 'saw', 'sax', 'say', 'sea', 'see', 'set', 'sew', 'she', 'shy', 'sin', 'sip', 'sir', 'sis', 'sit', 'six', 'ski', 'sky', 'sly', 'sob', 'sod', 'son', 'sop', 'sot', 'sow', 'sox', 'soy', 'spa', 'spy', 'sub', 'sue', 'sum', 'sun', 'sup', 'tab', 'tad', 'tag', 'tan', 'tap', 'tar', 'tat', 'tax', 'tea', 'tee', 'ten', 'the', 'thy', 'tic', 'tie', 'tin', 'tip', 'toe', 'ton', 'too', 'top', 'tow', 'toy', 'try', 'tub', 'tug', 'two', 'urn', 'use', 'van', 'var', 'vat', 'vet', 'vex', 'via', 'vie', 'vow', 'wad', 'wag', 'war', 'was', 'wax', 'way', 'web', 'wed', 'wee', 'wet', 'who', 'why', 'wig', 'win', 'wit', 'woe', 'wok', 'won', 'woo', 'wow', 'yak', 'yam', 'yap', 'yaw', 'yea', 'yes', 'yet', 'yew', 'yon', 'you', 'yow', 'zap', 'zen', 'zip', 'zoo',

    // 4-letter words
    'able', 'ache', 'acre', 'aged', 'aide', 'aims', 'airs', 'akin', 'ants', 'apes', 'apse', 'area', 'ares', 'aria', 'arid', 'arms', 'arts', 'asks', 'aster', 'babe', 'baby', 'back', 'bake', 'bald', 'ball', 'band', 'bank', 'bare', 'bark', 'barn', 'bars', 'base', 'bask', 'bast', 'bath', 'bats', 'bead', 'beak', 'beam', 'bean', 'bear', 'beat', 'beds', 'bees', 'bell', 'belt', 'bend', 'bent', 'best', 'beta', 'bias', 'bike', 'bile', 'bind', 'bins', 'bird', 'bite', 'bits', 'bled', 'blue', 'blur', 'boat', 'bold', 'bolt', 'bomb', 'bond', 'bone', 'book', 'bore', 'born', 'boss', 'both', 'bowl', 'bows', 'boys', 'bred', 'burn', 'bust', 'busy', 'cabs', 'cafe', 'cage', 'cake', 'calf', 'call', 'calm', 'came', 'camp', 'cane', 'cans', 'cape', 'caps', 'card', 'care', 'carp', 'cars', 'cart', 'case', 'cash', 'cast', 'cats', 'cave', 'cell', 'cent', 'chap', 'chat', 'chin', 'chip', 'chop', 'clad', 'clan', 'clap', 'claw', 'clay', 'clip', 'club', 'clue', 'coal', 'coat', 'code', 'coil', 'coin', 'cold', 'colt', 'comb', 'come', 'cone', 'cook', 'cool', 'cope', 'cord', 'core', 'cork', 'corn', 'cost', 'cots', 'coup', 'cove', 'cows', 'cozy', 'crab', 'cram', 'crib', 'crop', 'crow', 'cube', 'cubs', 'cues', 'cups', 'curb', 'cure', 'curl', 'cute', 'dabs', 'dads', 'damp', 'dare', 'dark', 'darn', 'dart', 'dash', 'date', 'dawn', 'days', 'dead', 'deaf', 'deal', 'dean', 'dear', 'debt', 'deck', 'deep', 'deer', 'demo', 'dens', 'dent', 'deny', 'desk', 'dial', 'dice', 'died', 'dies', 'diet', 'dime', 'dine', 'ding', 'dips', 'dire', 'dirt', 'disc', 'dish', 'disk', 'dive', 'dock', 'dodo', 'does', 'dogs', 'doll', 'dome', 'done', 'door', 'dope', 'dose', 'dots', 'dote', 'dove', 'down', 'doze', 'drab', 'drag', 'dram', 'draw', 'dray', 'drew', 'drip', 'drop', 'drug', 'drum', 'dual', 'duck', 'dude', 'duel', 'dues', 'duet', 'duke', 'dull', 'dumb', 'dump', 'dune', 'dunk', 'dusk', 'dust', 'duty', 'each', 'earl', 'earn', 'ears', 'ease', 'east', 'easy', 'eats', 'echo', 'edge', 'edit', 'eels', 'eggs', 'elks', 'else', 'emit', 'ends', 'epic', 'eras', 'even', 'ever', 'evil', 'exam', 'exit', 'eyed', 'eyes', 'face', 'fact', 'fade', 'fail', 'fair', 'fake', 'fall', 'fame', 'fang', 'fans', 'fare', 'farm', 'fast', 'fate', 'fawn', 'fear', 'feat', 'feed', 'feel', 'fees', 'feet', 'fell', 'felt', 'fern', 'fest', 'file', 'fill', 'film', 'find', 'fine', 'fink', 'fins', 'fire', 'firm', 'firs', 'fish', 'fist', 'fits', 'five', 'flag', 'flak', 'flan', 'flap', 'flat', 'flaw', 'flea', 'fled', 'flew', 'flex', 'flip', 'flit', 'flow', 'flue', 'foal', 'foam', 'foes', 'fogs', 'fold', 'folk', 'fond', 'font', 'food', 'fool', 'foot', 'ford', 'fork', 'form', 'fort', 'foul', 'four', 'fowl', 'foxy', 'fray', 'free', 'fret', 'frog', 'from', 'fuel', 'full', 'fume', 'fund', 'funk', 'furs', 'fury', 'fuse', 'fuss', 'gabs', 'gags', 'gain', 'gait', 'gale', 'gall', 'game', 'gang', 'gape', 'gaps', 'garb', 'gate', 'gave', 'gaze', 'gear', 'gels', 'gems', 'gene', 'gent', 'germ', 'gets', 'gift', 'gild', 'gill', 'gilt', 'girl', 'gist', 'give', 'glad', 'glee', 'glen', 'glow', 'glue', 'gnat', 'gnus', 'goal', 'goat', 'gobs', 'gods', 'goes', 'gold', 'golf', 'gone', 'gong', 'good', 'gore', 'gosh', 'gown', 'grab', 'grad', 'gram', 'gray', 'grew', 'grey', 'grid', 'grim', 'grin', 'grip', 'grit', 'grow', 'grub', 'gulf', 'gull', 'gulp', 'gums', 'guns', 'guru', 'gush', 'gust', 'guts', 'guys', 'gyms', 'hail', 'hair', 'half', 'hall', 'halo', 'halt', 'hams', 'hand', 'hang', 'hank', 'hard', 'hare', 'hark', 'harm', 'harp', 'hash', 'hasp', 'hate', 'haul', 'have', 'hawk', 'hays', 'haze', 'hazy', 'head', 'heal', 'heap', 'hear', 'heat', 'heed', 'heel', 'heir', 'held', 'hell', 'helm', 'help', 'hems', 'hens', 'herd', 'here', 'hero', 'hews', 'hide', 'high', 'hike', 'hill', 'hilt', 'hind', 'hint', 'hips', 'hire', 'hiss', 'hits', 'hive', 'hoax', 'hobs', 'hogs', 'hold', 'hole', 'holy', 'home', 'hone', 'honk', 'hood', 'hoof', 'hook', 'hoop', 'hoot', 'hope', 'hops', 'horn', 'hose', 'host', 'hour', 'howl', 'hubs', 'hues', 'huge', 'hugs', 'hulk', 'hull', 'hums', 'hung', 'hunk', 'hunt', 'hurl', 'hurt', 'hush', 'husk', 'huts', 'ibis', 'iced', 'ices', 'icon', 'idea', 'idle', 'iffy', 'inch', 'info', 'inks', 'inns', 'into', 'iota', 'ions', 'iris', 'iron', 'isle', 'itch', 'item', 'jabs', 'jabs', 'jack', 'jade', 'jags', 'jail', 'jams', 'jars', 'jaws', 'jays', 'jazz', 'jean', 'jeep', 'jeer', 'jets', 'jigs', 'jilt', 'jive', 'jobs', 'jogs', 'join', 'joke', 'jolt', 'jots', 'jowl', 'joys', 'jugs', 'july', 'jump', 'june', 'junk', 'jury', 'just', 'jute', 'kale', 'keel', 'keen', 'keep', 'kegs', 'kelp', 'keys', 'kick', 'kids', 'kill', 'kiln', 'kilt', 'kind', 'king', 'kink', 'kiss', 'kite', 'kits', 'kiwi', 'knee', 'knew', 'knit', 'knob', 'knot', 'know', 'labs', 'lace', 'lack', 'lacy', 'lads', 'lady', 'lags', 'laid', 'lain', 'lair', 'lake', 'lama', 'lamb', 'lame', 'lamp', 'land', 'lane', 'laps', 'lard', 'lark', 'lash', 'lass', 'last', 'late', 'laud', 'lava', 'lawn', 'laws', 'lays', 'laze', 'lazy', 'lead', 'leaf', 'leak', 'lean', 'leap', 'leas', 'leer', 'left', 'legs', 'lend', 'lens', 'lent', 'less', 'lest', 'lets', 'levy', 'liar', 'lice', 'lick', 'lids', 'lied', 'lien', 'lies', 'lieu', 'life', 'lift', 'like', 'lilt', 'lily', 'limb', 'lime', 'limp', 'line', 'link', 'lint', 'lion', 'lips', 'lisp', 'list', 'lite', 'live', 'load', 'loaf', 'loam', 'loan', 'lobe', 'lock', 'lode', 'loft', 'logs', 'loin', 'lone', 'long', 'look', 'loom', 'loon', 'loop', 'loot', 'lope', 'lord', 'lore', 'lorn', 'lose', 'loss', 'lost', 'lots', 'loud', 'lout', 'love', 'lows', 'lugs', 'lull', 'lump', 'lung', 'lure', 'lurk', 'lush', 'lust', 'lute', 'lynx', 'lyre', 'mace', 'macs', 'made', 'mads', 'mags', 'maid', 'mail', 'maim', 'main', 'make', 'male', 'mall', 'malt', 'mama', 'mane', 'mans', 'many', 'maps', 'mare', 'mark', 'mars', 'mart', 'mash', 'mask', 'mass', 'mast', 'mate', 'math', 'mats', 'maul', 'maze', 'mead', 'meal', 'mean', 'meat', 'meek', 'meet', 'meld', 'melt', 'memo', 'mend', 'menu', 'meow', 'mere', 'mesh', 'mess', 'meta', 'mice', 'mild', 'mile', 'milk', 'mill', 'mime', 'mind', 'mine', 'mink', 'mint', 'mire', 'miss', 'mist', 'mite', 'mitt', 'moan', 'moat', 'mobs', 'mock', 'mode', 'mods', 'mole', 'molt', 'moms', 'monk', 'mood', 'moon', 'moor', 'moot', 'mope', 'mops', 'more', 'morn', 'moss', 'most', 'moth', 'move', 'mown', 'much', 'muck', 'muds', 'mugs', 'mule', 'mull', 'mums', 'murk', 'muse', 'mush', 'musk', 'must', 'mute', 'mutt', 'myth', 'nabs', 'nags', 'nail', 'name', 'nape', 'naps', 'navy', 'nays', 'near', 'neat', 'neck', 'need', 'neon', 'nest', 'nets', 'news', 'newt', 'next', 'nice', 'nick', 'nigh', 'nine', 'nips', 'nits', 'nobs', 'nods', 'noel', 'nope', 'norm', 'nose', 'nosy', 'note', 'noun', 'nubs', 'nuke', 'null', 'numb', 'nuns', 'nuts', 'oafs', 'oaks', 'oars', 'oath', 'oats', 'obey', 'odds', 'odes', 'odor', 'offs', 'ogle', 'ogre', 'oils', 'oily', 'oink', 'okay', 'omen', 'omit', 'once', 'ones', 'only', 'onto', 'onus', 'ooze', 'opal', 'open', 'opts', 'oral', 'orbs', 'ores', 'ours', 'oust', 'outs', 'oval', 'oven', 'over', 'owed', 'owes', 'owls', 'owns', 'oxen', 'pace', 'pack', 'pact', 'pads', 'page', 'paid', 'pail', 'pain', 'pair', 'pale', 'pall', 'palm', 'pals', 'pane', 'pang', 'pans', 'pant', 'papa', 'paps', 'park', 'part', 'pass', 'past', 'pate', 'path', 'pats', 'pave', 'pawn', 'paws', 'pays', 'peak', 'peal', 'pear', 'peas', 'peat', 'peck', 'pecs', 'peds', 'peek', 'peel', 'peep', 'peer', 'pegs', 'pelt', 'pens', 'pent', 'peon', 'peps', 'perk', 'perm', 'pert', 'peso', 'pest', 'pets', 'pews', 'pick', 'pier', 'pies', 'pigs', 'pike', 'pile', 'pill', 'pimp', 'pine', 'ping', 'pink', 'pins', 'pint', 'pipe', 'pips', 'pits', 'pity', 'plan', 'play', 'plea', 'pled', 'plod', 'plop', 'plot', 'plow', 'ploy', 'plug', 'plum', 'plus', 'pock', 'pods', 'poem', 'poet', 'poke', 'pole', 'poll', 'polo', 'pomp', 'pond', 'pone', 'pony', 'pooh', 'pool', 'poop', 'poor', 'pope', 'pops', 'pore', 'pork', 'port', 'pose', 'posh', 'post', 'posy', 'pots', 'pour', 'pout', 'pram', 'prat', 'pray', 'prep', 'prey', 'prim', 'prod', 'prom', 'prop', 'prow', 'pubs', 'puck', 'puff', 'pugs', 'puke', 'pull', 'pulp', 'puma', 'pump', 'punk', 'puns', 'punt', 'puny', 'pupa', 'pups', 'pure', 'purl', 'purr', 'push', 'puts', 'putt', 'quad', 'quay', 'quit', 'quiz', 'race', 'rack', 'raft', 'rage', 'rags', 'raid', 'rail', 'rain', 'rake', 'ramp', 'rams', 'rang', 'rank', 'rant', 'rape', 'raps', 'rapt', 'rare', 'rash', 'rasp', 'rate', 'rats', 'rave', 'rays', 'raze', 'read', 'real', 'ream', 'reap', 'rear', 'redo', 'reds', 'reed', 'reef', 'reek', 'reel', 'rein', 'rend', 'rent', 'reps', 'rest', 'revs', 'ribs', 'rice', 'rich', 'ride', 'rids', 'rife', 'rift', 'rigs', 'rile', 'rill', 'rime', 'rims', 'rind', 'ring', 'rink', 'riot', 'ripe', 'rips', 'rise', 'risk', 'rite', 'road', 'roam', 'roan', 'roar', 'robe', 'robs', 'rock', 'rode', 'rods', 'roes', 'role', 'roll', 'romp', 'roof', 'rook', 'room', 'root', 'rope', 'rose', 'rosy', 'rote', 'rots', 'rout', 'rove', 'rows', 'rubs', 'rude', 'rued', 'rues', 'ruff', 'ruga', 'rugs', 'ruin', 'rule', 'rump', 'rums', 'rung', 'runs', 'runt', 'ruse', 'rush', 'rust', 'ruts', 'sack', 'safe', 'saga', 'sage', 'sago', 'sags', 'said', 'sail', 'sake', 'sale', 'salt', 'same', 'sand', 'sane', 'sang', 'sank', 'saps', 'sari', 'sash', 'sass', 'sate', 'save', 'saws', 'says', 'scab', 'scad', 'scam', 'scan', 'scar', 'scat', 'seal', 'seam', 'sear', 'seas', 'seat', 'sect', 'seed', 'seek', 'seem', 'seen', 'seep', 'seer', 'sees', 'self', 'sell', 'send', 'sent', 'serf', 'sets', 'sewn', 'sews', 'shad', 'shag', 'shah', 'sham', 'shed', 'shin', 'ship', 'shit', 'shod', 'shoe', 'shoo', 'shop', 'shot', 'show', 'shun', 'shut', 'sick', 'side', 'sift', 'sigh', 'sign', 'silk', 'sill', 'silo', 'silt', 'sine', 'sing', 'sink', 'sins', 'sips', 'sire', 'sirs', 'site', 'sits', 'size', 'skid', 'skim', 'skin', 'skip', 'skis', 'skit', 'slab', 'slag', 'slam', 'slap', 'slat', 'slaw', 'slay', 'sled', 'slew', 'slid', 'slim', 'slip', 'slit', 'slob', 'sloe', 'slog', 'slop', 'slot', 'slow', 'slug', 'slum', 'slur', 'smog', 'smug', 'snag', 'snap', 'snip', 'snob', 'snot', 'snow', 'snub', 'snug', 'soak', 'soap', 'soar', 'sobs', 'sock', 'soda', 'sods', 'sofa', 'soft', 'soil', 'sold', 'sole', 'solo', 'some', 'song', 'sons', 'soon', 'soot', 'sops', 'sore', 'sort', 'soul', 'soup', 'sour', 'sows', 'span', 'spar', 'spas', 'spat', 'spin', 'spit', 'spot', 'spry', 'spud', 'spun', 'spur', 'stab', 'stag', 'star', 'stat', 'stay', 'stem', 'step', 'stew', 'stir', 'stop', 'stow', 'stub', 'stud', 'stun', 'such', 'sued', 'sues', 'suit', 'sulk', 'sums', 'sung', 'sunk', 'suns', 'sups', 'sure', 'surf', 'swab', 'swag', 'swam', 'swan', 'swap', 'swat', 'sway', 'swim', 'swum', 'tack', 'taco', 'tact', 'tads', 'tags', 'tail', 'take', 'tale', 'talk', 'tall', 'tame', 'tamp', 'tang', 'tank', 'tans', 'tape', 'taps', 'tare', 'tarn', 'tarp', 'tars', 'tart', 'task', 'taut', 'taxi', 'teak', 'teal', 'team', 'tear', 'teas', 'teat', 'teed', 'teem', 'teen', 'tees', 'tell', 'tend', 'tens', 'tent', 'term', 'tern', 'test', 'text', 'than', 'that', 'thaw', 'thee', 'them', 'then', 'thew', 'they', 'thin', 'this', 'thud', 'thug', 'thus', 'tick', 'tide', 'tidy', 'tied', 'tier', 'ties', 'tile', 'till', 'tilt', 'time', 'tine', 'ting', 'tins', 'tint', 'tiny', 'tips', 'tire', 'toad', 'toes', 'tofu', 'toga', 'togs', 'toil', 'told', 'toll', 'tomb', 'tome', 'tone', 'tong', 'tons', 'took', 'tool', 'toot', 'tops', 'tore', 'torn', 'tort', 'toss', 'tote', 'tots', 'tour', 'tout', 'town', 'tows', 'toys', 'tram', 'trap', 'tray', 'tree', 'trek', 'trim', 'trio', 'trip', 'trod', 'trot', 'trow', 'troy', 'true', 'tsar', 'tuba', 'tube', 'tubs', 'tuck', 'tuft', 'tugs', 'tuna', 'tune', 'tuns', 'turd', 'turf', 'turn', 'tusk', 'tutu', 'twas', 'twig', 'twin', 'twit', 'twos', 'type', 'typo', 'ugly', 'undo', 'unit', 'unto', 'upon', 'urge', 'urns', 'used', 'user', 'uses', 'vain', 'vale', 'vamp', 'vane', 'vans', 'vary', 'vase', 'vast', 'vats', 'veal', 'veer', 'veil', 'vein', 'vend', 'vent', 'verb', 'very', 'vest', 'veto', 'vets', 'vial', 'vice', 'vied', 'vies', 'view', 'vile', 'vine', 'vise', 'void', 'volt', 'vote', 'vows', 'wade', 'wads', 'waft', 'wage', 'wags', 'wail', 'wait', 'wake', 'walk', 'wall', 'wane', 'want', 'ward', 'ware', 'warm', 'warn', 'warp', 'wars', 'wart', 'wary', 'wash', 'wasp', 'watt', 'wave', 'wavy', 'waxy', 'ways', 'weak', 'wean', 'wear', 'webs', 'weds', 'weed', 'week', 'weep', 'weft', 'well', 'welt', 'went', 'wept', 'were', 'west', 'wets', 'what', 'when', 'whet', 'whey', 'whim', 'whip', 'whir', 'whit', 'whiz', 'whom', 'wick', 'wide', 'wife', 'wigs', 'wild', 'wile', 'will', 'wilt', 'wily', 'wimp', 'wind', 'wine', 'wing', 'wink', 'wins', 'wipe', 'wire', 'wiry', 'wise', 'wish', 'wisp', 'with', 'wits', 'woke', 'wolf', 'womb', 'wont', 'wood', 'woof', 'wool', 'word', 'wore', 'work', 'worm', 'worn', 'wort', 'wove', 'wrap', 'wren', 'writ', 'yack', 'yaks', 'yams', 'yang', 'yank', 'yaps', 'yard', 'yarn', 'yawl', 'yawn', 'yaws', 'yeah', 'year', 'yeas', 'yell', 'yelp', 'yens', 'yews', 'yoke', 'yolk', 'yore', 'your', 'yowl', 'yule', 'yurt', 'zany', 'zaps', 'zeal', 'zero', 'zest', 'zeta', 'zinc', 'zing', 'zips', 'zone', 'zonk', 'zoom', 'zoos',

    // 5-letter words (selected kid-friendly ones)
    'about', 'above', 'acorn', 'actor', 'after', 'again', 'agent', 'alert', 'alien', 'alike', 'alone', 'along', 'angel', 'anger', 'angle', 'angry', 'apple', 'apron', 'arena', 'argue', 'arise', 'arose', 'arson', 'aster', 'atone', 'audio', 'awake', 'badge', 'baker', 'basic', 'basin', 'baton', 'beach', 'beast', 'bears', 'beads', 'began', 'being', 'below', 'bench', 'berry', 'birth', 'black', 'blade', 'blame', 'blank', 'blast', 'blaze', 'bleat', 'blend', 'bless', 'blind', 'blink', 'blond', 'blood', 'bloom', 'blown', 'board', 'boast', 'bones', 'bonus', 'boost', 'booth', 'bound', 'brain', 'brand', 'brass', 'brave', 'bread', 'break', 'breed', 'brick', 'bride', 'brief', 'bring', 'brink', 'brisk', 'broad', 'broke', 'brook', 'brown', 'brush', 'build', 'built', 'burst', 'cable', 'cabin', 'cadet', 'camel', 'canal', 'cares', 'cargo', 'carol', 'carry', 'carve', 'catch', 'cater', 'chain', 'chair', 'chalk', 'champ', 'chant', 'chaos', 'chard', 'charm', 'chart', 'chase', 'cheap', 'cheat', 'check', 'cheek', 'cheer', 'chess', 'chest', 'chick', 'chief', 'child', 'chill', 'chimp', 'china', 'chirp', 'choke', 'chord', 'chore', 'chose', 'chunk', 'cider', 'cigar', 'claim', 'clamp', 'clasp', 'class', 'clean', 'clear', 'clerk', 'click', 'cliff', 'climb', 'cling', 'cloak', 'clock', 'close', 'cloth', 'cloud', 'clown', 'coach', 'coast', 'coins', 'comet', 'coral', 'cords', 'coast', 'count', 'court', 'cover', 'crack', 'craft', 'crane', 'crank', 'crash', 'crate', 'crave', 'craze', 'crazy', 'creak', 'cream', 'creek', 'creep', 'crest', 'crime', 'crisp', 'croak', 'crone', 'crook', 'cross', 'crowd', 'crown', 'crude', 'cruel', 'crush', 'crust', 'curse', 'curve', 'daisy', 'dance', 'dares', 'dates', 'dealt', 'death', 'decor', 'deity', 'delay', 'delta', 'dense', 'depot', 'depth', 'diner', 'dirty', 'dosed', 'doted', 'drain', 'drank', 'drape', 'dread', 'dream', 'dress', 'dried', 'drier', 'drift', 'drill', 'drink', 'drive', 'drone', 'droop', 'drown', 'drums', 'drunk', 'earth', 'eater', 'eight', 'enter', 'epics', 'erase', 'feast', 'fiber', 'field', 'fiend', 'fiery', 'fifty', 'final', 'finer', 'first', 'fires', 'flame', 'flank', 'flare', 'flash', 'flask', 'fleet', 'flesh', 'flier', 'fling', 'flint', 'flirt', 'float', 'flock', 'flood', 'floor', 'floral', 'floss', 'flour', 'flown', 'flute', 'foams', 'focus', 'force', 'forge', 'forth', 'forty', 'forum', 'found', 'frame', 'frank', 'fraud', 'freak', 'freed', 'fresh', 'fried', 'front', 'frost', 'frown', 'froze', 'fruit', 'gales', 'gates', 'genie', 'genre', 'ghost', 'giant', 'given', 'gland', 'glare', 'glass', 'gleam', 'glean', 'glide', 'glint', 'globe', 'gloom', 'glory', 'gloss', 'glove', 'goals', 'goats', 'going', 'grace', 'grade', 'grain', 'grand', 'grant', 'grape', 'grasp', 'grass', 'grate', 'grave', 'graze', 'great', 'greed', 'green', 'greet', 'grief', 'grill', 'grime', 'grind', 'groan', 'groom', 'grope', 'gross', 'group', 'grove', 'grown', 'guard', 'guess', 'guest', 'guide', 'guild', 'guilt', 'haste', 'hater', 'heart', 'horse', 'irate', 'laden', 'later', 'lemon', 'loser', 'manes', 'meats', 'moist', 'moral', 'nails', 'names', 'nears', 'nears', 'neato', 'noise', 'nopes', 'north', 'nosed', 'noted', 'oared', 'oaten', 'oater', 'ocean', 'onest', 'onset', 'opera', 'optic', 'opted', 'orate', 'oread', 'organ', 'osier', 'otter', 'outer', 'ovate', 'pains', 'panes', 'pants', 'paper', 'parse', 'parts', 'paste', 'paten', 'pater', 'pears', 'peons', 'pesto', 'piano', 'pianos', 'place', 'plane', 'plant', 'plate', 'plays', 'point', 'pored', 'pores', 'ports', 'poser', 'poster', 'prate', 'prone', 'prose', 'query', 'quiet', 'raise', 'rales', 'range', 'rapes', 'raped', 'rared', 'rares', 'rased', 'raser', 'rated', 'rates', 'ration', 'ratio', 'reads', 'reaps', 'rears', 'reins', 'rents', 'repos', 'ropes', 'rosed', 'roset', 'rotas', 'rotes', 'saint', 'salon', 'satan', 'sated', 'satin', 'sedan', 'sepia', 'septa', 'serio', 'seron', 'shore', 'snare', 'snore', 'sonar', 'songs', 'sored', 'sorel', 'sound', 'spare', 'spear', 'spoke', 'spore', 'sport', 'stale', 'stamp', 'stand', 'stare', 'start', 'state', 'stead', 'steal', 'steam', 'steel', 'steer', 'stern', 'stone', 'stomp', 'stood', 'stoop', 'stop', 'store', 'storm', 'story', 'stove', 'strap', 'strep', 'strip', 'tails', 'tales', 'talon', 'tamed', 'tames', 'taper', 'tares', 'tarns', 'taros', 'tarts', 'taste', 'teals', 'teams', 'tears', 'tense', 'tents', 'terns', 'those', 'tides', 'tinea', 'tires', 'toast', 'toned', 'tones', 'topes', 'toped', 'toper', 'toped', 'tores', 'train', 'trans', 'traps', 'trash', 'treason', 'treat', 'trees', 'trial', 'tribe', 'tried', 'tries', 'trips', 'trope', 'tunes',
]);

// ==========================================
// STATE MANAGEMENT
// ==========================================

let gameState = {
    score: 0,
    wordsFound: 0,
    currentSet: 0,
    isPlaying: false,
    availableLetters: [],
    currentWord: [],
    foundWords: [],
    usedLetterIndices: [],
};

// ==========================================
// DOM REFERENCES
// ==========================================

const elements = {
    // Buttons
    startBtn: document.getElementById('startBtn'),
    submitBtn: document.getElementById('submitBtn'),
    clearBtn: document.getElementById('clearBtn'),
    nextSetBtn: document.getElementById('nextSetBtn'),
    playAgainBtn: document.getElementById('playAgainBtn'),

    // Display elements
    scoreDisplay: document.getElementById('score'),
    wordsFoundDisplay: document.getElementById('wordsFound'),
    currentSetDisplay: document.getElementById('currentSet'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalWordsCountDisplay: document.getElementById('finalWordsCount'),
    performanceMessage: document.getElementById('performanceMessage'),
    gameMessage: document.getElementById('gameMessage'),
    gameArea: document.getElementById('gameArea'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),

    // Game elements
    availableLetters: document.getElementById('availableLetters'),
    wordBuilder: document.getElementById('wordBuilder'),
    wordsList: document.getElementById('wordsList'),
    wordLengthHint: document.getElementById('wordLengthHint'),
};

// ==========================================
// GAME INITIALIZATION
// ==========================================

function initGame() {
    console.log('Word Building game initialized');
    setupEventListeners();
    resetGame();
}

function setupEventListeners() {
    // Start button
    elements.startBtn.addEventListener('touchstart', handleStart);
    elements.startBtn.addEventListener('click', handleStart);

    // Submit button
    elements.submitBtn.addEventListener('touchstart', handleSubmit);
    elements.submitBtn.addEventListener('click', handleSubmit);

    // Clear button
    elements.clearBtn.addEventListener('touchstart', handleClear);
    elements.clearBtn.addEventListener('click', handleClear);

    // Next Set button
    elements.nextSetBtn.addEventListener('touchstart', handleNextSet);
    elements.nextSetBtn.addEventListener('click', handleNextSet);

    // Play again button
    elements.playAgainBtn.addEventListener('touchstart', handleRestart);
    elements.playAgainBtn.addEventListener('click', handleRestart);
}

// ==========================================
// GAME CONTROL FUNCTIONS
// ==========================================

function startGame() {
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.wordsFound = 0;
    gameState.currentSet = 0;
    gameState.foundWords = [];

    // Update UI
    elements.gameMessage.classList.add('hidden');
    elements.startBtn.style.display = 'none';
    elements.submitBtn.style.display = 'inline-block';
    elements.clearBtn.style.display = 'inline-block';

    updateScoreDisplay();
    updateWordsFoundDisplay();
    updateCurrentSetDisplay();

    // Start first set
    loadNextSet();

    console.log('Game started');
}

function loadNextSet() {
    if (gameState.currentSet >= CONFIG.totalSets) {
        endGame();
        return;
    }

    gameState.currentSet++;
    gameState.currentWord = [];
    gameState.usedLetterIndices = [];
    gameState.foundWords = [];

    // Load the letter set
    const setIndex = (gameState.currentSet - 1) % LETTER_SETS.length;
    gameState.availableLetters = [...LETTER_SETS[setIndex]];

    // Display letters and reset UI
    displayAvailableLetters();
    clearWordBuilder();
    displayFoundWords();
    updateCurrentSetDisplay();

    // Update hint
    elements.wordLengthHint.textContent = `Minimum ${CONFIG.minWordLength} letters`;

    // Hide next set button
    elements.nextSetBtn.style.display = 'none';
    elements.submitBtn.style.display = 'inline-block';
    elements.clearBtn.style.display = 'inline-block';

    console.log('Set', gameState.currentSet, 'Letters:', gameState.availableLetters.join(''));
}

function displayAvailableLetters() {
    elements.availableLetters.innerHTML = '';

    gameState.availableLetters.forEach((letter, index) => {
        const tile = document.createElement('button');
        tile.className = 'letter-tile';
        tile.textContent = letter;
        tile.dataset.letter = letter;
        tile.dataset.index = index;

        tile.addEventListener('touchstart', handleLetterClick);
        tile.addEventListener('click', handleLetterClick);

        elements.availableLetters.appendChild(tile);
    });
}

function handleLetterClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const tile = e.currentTarget;
    const index = parseInt(tile.dataset.index);

    // Check if already used
    if (gameState.usedLetterIndices.includes(index)) return;

    // Add to current word
    const letter = tile.dataset.letter;
    gameState.currentWord.push({ letter, index });
    gameState.usedLetterIndices.push(index);

    // Mark as used
    tile.classList.add('used');

    // Update word builder
    updateWordBuilder();

    // Add bounce animation
    tile.classList.add('bounce');
    setTimeout(() => tile.classList.remove('bounce'), 500);
}

function updateWordBuilder() {
    elements.wordBuilder.innerHTML = '';

    if (gameState.currentWord.length === 0) {
        elements.wordBuilder.classList.remove('has-letters');
        elements.wordBuilder.classList.add('empty');
        return;
    }

    elements.wordBuilder.classList.remove('empty');
    elements.wordBuilder.classList.add('has-letters');

    gameState.currentWord.forEach((item, wordIndex) => {
        const tile = document.createElement('div');
        tile.className = 'builder-tile';
        tile.textContent = item.letter;
        tile.dataset.wordIndex = wordIndex;
        tile.dataset.letterIndex = item.index;

        // Allow clicking to remove
        tile.addEventListener('touchstart', handleBuilderTileClick);
        tile.addEventListener('click', handleBuilderTileClick);

        elements.wordBuilder.appendChild(tile);
    });

    // Update hint based on length
    const currentLength = gameState.currentWord.length;
    if (currentLength < CONFIG.minWordLength) {
        elements.wordLengthHint.textContent = `Need ${CONFIG.minWordLength - currentLength} more letter${CONFIG.minWordLength - currentLength > 1 ? 's' : ''}`;
        elements.wordLengthHint.style.color = '#999';
    } else {
        elements.wordLengthHint.textContent = `${currentLength} letters - Ready to submit!`;
        elements.wordLengthHint.style.color = '#11998e';
    }
}

function handleBuilderTileClick(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    const tile = e.currentTarget;
    const wordIndex = parseInt(tile.dataset.wordIndex);
    const letterIndex = parseInt(tile.dataset.letterIndex);

    // Remove from current word
    gameState.currentWord.splice(wordIndex, 1);
    gameState.usedLetterIndices = gameState.usedLetterIndices.filter(i => i !== letterIndex);

    // Unmark the letter tile
    const letterTiles = elements.availableLetters.querySelectorAll('.letter-tile');
    letterTiles[letterIndex].classList.remove('used');

    // Update display
    updateWordBuilder();
}

function clearWordBuilder() {
    gameState.currentWord = [];
    gameState.usedLetterIndices = [];

    // Unmark all tiles
    const letterTiles = elements.availableLetters.querySelectorAll('.letter-tile');
    letterTiles.forEach(tile => tile.classList.remove('used'));

    updateWordBuilder();
}

function submitWord() {
    const word = gameState.currentWord.map(item => item.letter).join('').toLowerCase();

    // Validate length
    if (word.length < CONFIG.minWordLength) {
        showFeedback(`Need at least ${CONFIG.minWordLength} letters!`, 'wrong');
        elements.wordBuilder.classList.add('shake');
        setTimeout(() => elements.wordBuilder.classList.remove('shake'), 500);
        return;
    }

    // Check if already found
    if (gameState.foundWords.includes(word)) {
        showFeedback('Already found!', 'info');
        elements.wordBuilder.classList.add('shake');
        setTimeout(() => elements.wordBuilder.classList.remove('shake'), 500);
        clearWordBuilder();
        return;
    }

    // Validate against dictionary
    if (!VALID_WORDS.has(word)) {
        showFeedback('Not a valid word!', 'wrong');
        elements.wordBuilder.classList.add('shake');
        setTimeout(() => elements.wordBuilder.classList.remove('shake'), 500);
        return;
    }

    // Word is valid!
    handleValidWord(word);
}

function handleValidWord(word) {
    // Add to found words
    gameState.foundWords.push(word);

    // Calculate score (word length)
    const points = word.length;
    gameState.score += points;
    gameState.wordsFound++;

    // Show success feedback
    showFeedback(`+${points} points!`, 'correct');

    // Animate word builder
    elements.wordBuilder.classList.add('pulse');
    setTimeout(() => elements.wordBuilder.classList.remove('pulse'), 300);

    // Update displays
    updateScoreDisplay();
    updateWordsFoundDisplay();
    displayFoundWords();

    // Pulse score
    elements.scoreDisplay.classList.add('pulse');
    setTimeout(() => elements.scoreDisplay.classList.remove('pulse'), 300);

    // Clear for next word
    clearWordBuilder();
}

function displayFoundWords() {
    const noWordsMsg = elements.wordsList.querySelector('.no-words');

    if (gameState.foundWords.length === 0) {
        if (!noWordsMsg) {
            elements.wordsList.innerHTML = '<div class="no-words">No words found yet!</div>';
        }
        return;
    }

    // Remove no-words message
    if (noWordsMsg) {
        noWordsMsg.remove();
    }

    // Clear and rebuild list
    elements.wordsList.innerHTML = '';

    gameState.foundWords.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'found-word';

        const wordText = document.createElement('span');
        wordText.textContent = word.toUpperCase();

        const scoreSpan = document.createElement('span');
        scoreSpan.className = 'word-score';
        scoreSpan.textContent = word.length;

        wordElement.appendChild(wordText);
        wordElement.appendChild(scoreSpan);

        elements.wordsList.appendChild(wordElement);
    });
}

function showNextSetButton() {
    elements.submitBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
    elements.nextSetBtn.style.display = 'inline-block';

    showFeedback('Great job! Ready for the next set?', 'info');
}

function endGame() {
    gameState.isPlaying = false;

    // Calculate performance message
    let performanceMsg = '';
    if (gameState.wordsFound >= 20) {
        performanceMsg = 'Outstanding! You\'re a word master!';
    } else if (gameState.wordsFound >= 15) {
        performanceMsg = 'Excellent work! Keep it up!';
    } else if (gameState.wordsFound >= 10) {
        performanceMsg = 'Good job! You\'re getting better!';
    } else {
        performanceMsg = 'Nice try! Practice makes perfect!';
    }

    elements.performanceMessage.textContent = performanceMsg;
    elements.finalScoreDisplay.textContent = gameState.score;
    elements.finalWordsCountDisplay.textContent = gameState.wordsFound;
    elements.gameOverOverlay.style.display = 'flex';

    console.log('Game ended. Final score:', gameState.score, 'Words found:', gameState.wordsFound);
}

function resetGame() {
    gameState.score = 0;
    gameState.wordsFound = 0;
    gameState.currentSet = 0;
    gameState.isPlaying = false;
    gameState.availableLetters = [];
    gameState.currentWord = [];
    gameState.foundWords = [];
    gameState.usedLetterIndices = [];

    // Reset UI
    elements.gameMessage.classList.remove('hidden');
    elements.startBtn.style.display = 'inline-block';
    elements.submitBtn.style.display = 'none';
    elements.clearBtn.style.display = 'none';
    elements.nextSetBtn.style.display = 'none';
    elements.gameOverOverlay.style.display = 'none';

    // Clear game area
    elements.availableLetters.innerHTML = '';
    elements.wordBuilder.innerHTML = '';
    elements.wordsList.innerHTML = '<div class="no-words">No words found yet!</div>';

    updateScoreDisplay();
    updateWordsFoundDisplay();
    updateCurrentSetDisplay();

    console.log('Game reset');
}

// ==========================================
// EVENT HANDLERS
// ==========================================

function handleStart(e) {
    e.preventDefault();
    if (!gameState.isPlaying) {
        startGame();
    }
}

function handleSubmit(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    submitWord();
}

function handleClear(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    clearWordBuilder();
}

function handleNextSet(e) {
    e.preventDefault();
    if (!gameState.isPlaying) return;

    loadNextSet();
}

function handleRestart(e) {
    e.preventDefault();
    resetGame();
    startGame();
}

// ==========================================
// UI UPDATE FUNCTIONS
// ==========================================

function updateScoreDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
}

function updateWordsFoundDisplay() {
    elements.wordsFoundDisplay.textContent = gameState.wordsFound;
}

function updateCurrentSetDisplay() {
    elements.currentSetDisplay.textContent = `${gameState.currentSet}/${CONFIG.totalSets}`;
}

function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;

    elements.gameArea.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 1500);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Check if a word can be made from available letters
 */
function canMakeWord(word, letters) {
    const lettersCopy = [...letters];
    for (let char of word) {
        const index = lettersCopy.indexOf(char.toUpperCase());
        if (index === -1) return false;
        lettersCopy.splice(index, 1);
    }
    return true;
}

// ==========================================
// START THE GAME
// ==========================================

document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on long press (mobile)
window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});
