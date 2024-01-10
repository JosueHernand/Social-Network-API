const { User, Thought } = require('../models')

module.exports = {

  async getUsers(req, res) {
    try {
      const users = await User.find()
      res.json(users)
    } catch (err) {
      res.status(500).json(err)
    }
  },

  async getSingleUser(req, res) {
    try {
      const user = await User.findOne({ _id: req.params.id })
        .select('-__v')
        .populate('friends')
        .populate('thoughts')
      if (!user) {
        return res.status(404).json({ message: 'No user with this id!' })
      }
      res.json(user)
    } catch (err) {
      res.status(500).json(err)
    }
  },

  async createUser(req, res) {
    try {
      const user = await User.create(req.body)
      res.json(user)
    } catch (err) {
      res.status(500).json(err)
    }
  },

  async updateUser(req, res) {
    try {
      const user = await User.findOneAndUpdate({_id: req.params.id},
      {$set: req.body},
      {runValidators: true, new: true});
    if (!user) {
      return res.status(404).json({ message: 'No user with this id!' })
    }
    res.json(user)
  } catch (err) {
    res.status(500).json(err)
  }
  },

  async deleteUser(req, res) {
    try {
      const user = await User.findOneAndDelete({_id: req.params.id})
      if (!user) {
        return res.status(404).json({ message: 'No user with this id!' })
      }
      user.thoughts.forEach(async thought => {
        await Thought.findOneAndDelete({_id: thought})
      })
      user.friends.forEach(async friend => {
        await User.findOneAndUpdate(
          {_id: friend},
          {$pull: {friends: req.params.id}}
        )
      })
      res.json(user)
    } catch (err) {
      res.status(500).json(err)
    }
  },

  async addFriend(req, res) {
    try {
      const user = await User.findOneAndUpdate(
        {_id: req.params.userId},
        {$addToSet: {friends: req.params.friendId}},
        {new: true}
      )
      if (!user) {
        return res.status(404).json({ message: 'No user with this id!' })
      }
      res.json(user)
    } catch (err) {
      res.status(500).json(err)
    }
  },

  async deleteFriend(req, res) {
    try {
      const user = await User.findOneAndUpdate(
        {_id: req.params.userId},
        {$pull: {friends: req.params.friendId}},
        {new: true}
      )
      if (!user) {
        return res.status(404).json({ message: 'No user with this id!' })
      }
      res.json(user)
    } catch (err) {
      res.status(500).json(err)
    }
  }
};