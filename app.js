const express = require('express')
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const app = express()
const port = process.env.PORT || 3000
const date = require(__dirname + "/date.js")
const _ = require('lodash');
const uri = process.env.MONGODB_URI

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }))

app.use(express.static(__dirname + '/public'));

mongoose.connect(uri);

const itemSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
    name: "Welcome to your to do list"
})

const item2 = new Item({
    name: "Hit the + button to add a new item"
})

const item3 = new Item({
    name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3]


const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema)


app.get('/', (req, res) => {
    Item.find({}, (err, itemsFound) => {
        if (itemsFound.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("Successfully inserted")
                }
            })
            res.redirect("/")
        } else {
            res.render("list", { listTitle: date.getDay(), newListItem: itemsFound })
        }
    })
});

app.post("/", (req, res) => {
    var itemName = req.body.input
    var listName = req.body.button

    const item = new Item({
        name: itemName
    })

    if (listName === date.getDay()) {
        item.save()
        res.redirect("/")
    } else {
        List.findOne({ name: listName }, (err, itemsFound) => {
            itemsFound.items.push(item)
            itemsFound.save()
            res.redirect("/" + listName)
        })
    }
})

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({ name: customListName }, (err, result) => {
        if (!result) {
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save()
            res.redirect("/" + customListName)
        } else {
            res.render("list", { listTitle: customListName, newListItem: result.items })
        }
    })
})

app.post("/delete", (req, res) => {
    const checkedItemId = req.body.checkbox
    const currentList = req.body.currentList

    if (currentList === date.getDay()) {
        Item.findByIdAndRemove(checkedItemId, (err) => {
            if (!err) {
                console.log("Successfully deleted")
                res.redirect("/")
            }
        })
    } else {
        List.findOneAndUpdate({ name: currentList }, { $pull: { items: { _id: checkedItemId } } }, (err, foundList) => {
            if (!err) {
                console.log("Successfully deleted")
                res.redirect("/" + currentList)
            }
        })
    }
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})