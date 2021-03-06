const fs = require('fs');
const slug = require('sluglife');
const hbs = require('./hbs');

const config = require('./config');
const baseUrl = `${config.root}/docs`;
// cd /Users/manjeshpv/Downloads/product-dump/products-dump/product_reviews
// mkdir ../two
// mv `ls | head -1000` ../two`
const dataFilePath = '/Users/manjeshpv/Downloads/product-dump/products-dump/four';

const seoInformation = (_post) => {
    const post = _post;

    console.log(post.slug);
    post.author = 'Suvojit Manna';
    post.seo = {
        title: post.title,
        tags: post.title,
        description: post.title,
    };
    post.created_at  = new Date();
    post.updated_at = new Date();

    return post;
};

const save = async (f, i) => {
    const product = require(f);

    const post = {
        title: product.prod_name,
        slug: slug(product.prod_name, {'mode': 'rfc3986'})
    };
    const file = `${baseUrl}/products/${post.slug}.html`
    const stat = fs.existsSync(file);
    console.log(i, file, !!stat);
    if(stat) {
        console.log('>>>>>>>> skipped', file, i)
        return
    }

    const allSentences = [];
    post.reviews = product
        .reviews
        .map(x => {
            allSentences.push(...x.sentences.filter(x => x.polarity));
            return x.review_text;
        });

    post.positive_reviews = [];
    post.negative_reviews = [];
    const sorted = allSentences
        .sort((a, b) => (b.polarity - a.polarity))
        .forEach(x => {
            if(x.polarity > 0) post.positive_reviews.push(x.text);
            post.negative_reviews.push(x.text);
        });


    const renderedMarkdownFile = hbs.render(seoInformation(post), 'readme');

    fs.writeFileSync(file, renderedMarkdownFile)
};

const run = async () => {
    console.log('starting run');
    const files = fs.readdirSync(dataFilePath);

    for(let i =0; i < files.length; i += 1){
        const file = files[i];
        try {
            console.log('iterating', i);
            await save(`${dataFilePath}/${file}`, i)
        } catch (err) {
            console.log('error while', file, err.message)
        }
    }
};

run();

