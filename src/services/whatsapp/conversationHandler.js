const { User, ServiceProvider, Service, Booking, Category, Location } = require('../../models');
const paymentService = require('../paymentService');
const logger = require('../../utils/logger');

class ConversationHandler {
  async handleTextMessage(text, user, state) {
    const lowerText = text.toLowerCase().trim();

    switch (state.step) {
      case 'welcome':
        return this.handleWelcome(lowerText, user);
      
      case 'registration_name':
        return this.handleRegistrationName(text, user, state);
      
      case 'service_search':
        return this.handleServiceSearch(text, user, state);
      
      case 'booking_description':
        return this.handleBookingDescription(text, user, state);
      
      case 'booking_date':
        return this.handleBookingDate(text, user, state);
      
      case 'provider_registration_business':
        return this.handleProviderBusinessName(text, user, state);
      
      case 'provider_registration_description':
        return this.handleProviderDescription(text, user, state);
      
      case 'provider_registration_rate':
        return this.handleProviderRate(text, user, state);
      
      default:
        return this.handleDefault(lowerText, user);
    }
  }

  async handleInteractiveMessage(interactive, user, state) {
    const buttonId = interactive.button_reply?.id || interactive.list_reply?.id;

    switch (buttonId) {
      case 'book_service':
        return this.startBookingFlow(user);
      
      case 'become_provider':
        return this.startProviderRegistration(user);
      
      case 'my_bookings':
        return this.showUserBookings(user);
      
      case 'help':
        return this.showHelp();
      
      default:
        if (buttonId?.startsWith('category_')) {
          const categoryId = buttonId.replace('category_', '');
          return this.handleCategorySelection(categoryId, user, state);
        }
        
        if (buttonId?.startsWith('service_')) {
          const serviceId = buttonId.replace('service_', '');
          return this.handleServiceSelection(serviceId, user, state);
        }
        
        if (buttonId?.startsWith('provider_')) {
          const providerId = buttonId.replace('provider_', '');
          return this.handleProviderSelection(providerId, user, state);
        }
        
        return this.handleDefault('', user);
    }
  }

  async handleLocationMessage(location, user, state) {
    if (state.step === 'booking_location') {
      return this.handleBookingLocation(location, user, state);
    }
    
    return {
      text: 'Thank you for sharing your location! Please let me know how I can help you.',
    };
  }

  async handleWelcome(text, user) {
    const greetings = ['hi', 'hello', 'hey', 'start', 'menu'];
    
    if (greetings.some(greeting => text.includes(greeting)) || !user?.isVerified) {
      const welcomeText = user?.isVerified 
        ? `Welcome back, ${user.firstName}! How can I help you today?`
        : `Welcome to Fundis & Freelancers! 👋\n\nI'm here to help you find trusted local service providers or register as a service provider yourself.`;

      const buttons = [
        { id: 'book_service', title: '🔍 Find Services' },
        { id: 'become_provider', title: '💼 Become Provider' },
        { id: 'my_bookings', title: '📋 My Bookings' },
        { id: 'help', title: '❓ Help' },
      ];

      return {
        text: welcomeText,
        buttons: buttons,
        nextState: { step: 'main_menu', data: {} },
      };
    }

    return this.handleDefault(text, user);
  }

  async startBookingFlow(user) {
    if (!user?.isVerified) {
      return {
        text: 'Please complete your registration first. What\'s your full name?',
        nextState: { step: 'registration_name', data: {} },
      };
    }

    const categories = await Category.findAll({
      where: { isActive: true, parentId: null },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
    });

    const sections = [{
      title: 'Service Categories',
      rows: categories.map(category => ({
        id: `category_${category.id}`,
        title: category.name,
        description: category.description || '',
      })),
    }];

    return {
      text: 'What type of service are you looking for?',
      list: {
        buttonText: 'Select Category',
        sections: sections,
      },
      nextState: { step: 'category_selection', data: {} },
    };
  }

  async handleCategorySelection(categoryId, user, state) {
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return {
        text: 'Sorry, that category was not found. Please try again.',
      };
    }

    const services = await Service.findAll({
      where: { categoryId: categoryId, isActive: true },
      include: [
        {
          model: ServiceProvider,
          as: 'provider',
          where: { isActive: true, isVerified: true },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
      ],
      limit: 10,
    });

    if (services.length === 0) {
      return {
        text: `Sorry, no services are currently available in the ${category.name} category. Please try another category or check back later.`,
        buttons: [
          { id: 'book_service', title: 'Browse Categories' },
          { id: 'help', title: 'Get Help' },
        ],
      };
    }

    const sections = [{
      title: `${category.name} Services`,
      rows: services.map(service => ({
        id: `service_${service.id}`,
        title: service.title,
        description: `KES ${service.price} - ${service.provider.user.firstName} ${service.provider.user.lastName}`,
      })),
    }];

    return {
      text: `Here are available ${category.name.toLowerCase()} services:`,
      list: {
        buttonText: 'Select Service',
        sections: sections,
      },
      nextState: { 
        step: 'service_selection', 
        data: { categoryId: categoryId, categoryName: category.name } 
      },
    };
  }

  async handleServiceSelection(serviceId, user, state) {
    const service = await Service.findByPk(serviceId, {
      include: [
        {
          model: ServiceProvider,
          as: 'provider',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'phoneNumber'],
            },
            {
              model: Location,
              as: 'location',
              attributes: ['name'],
            },
          ],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['name'],
        },
      ],
    });

    if (!service) {
      return {
        text: 'Sorry, that service was not found. Please try again.',
      };
    }

    const providerName = `${service.provider.user.firstName} ${service.provider.user.lastName}`;
    const location = service.provider.location?.name || 'Location not specified';
    const rating = service.provider.rating > 0 ? `⭐ ${service.provider.rating}/5` : 'New provider';

    const serviceDetails = `
📋 *${service.title}*
💰 Price: KES ${service.price}${service.priceType === 'hourly' ? '/hour' : ''}
👤 Provider: ${providerName}
📍 Location: ${location}
${rating}
${service.provider.completedJobs > 0 ? `✅ ${service.provider.completedJobs} jobs completed` : ''}

${service.description || ''}
    `.trim();

    const buttons = [
      { id: `book_${serviceId}`, title: '📅 Book Now' },
      { id: `provider_${service.provider.id}`, title: '👤 View Provider' },
      { id: 'book_service', title: '🔙 Back to Categories' },
    ];

    return {
      text: serviceDetails,
      buttons: buttons,
      nextState: { 
        step: 'service_details', 
        data: { 
          serviceId: serviceId,
          providerId: service.provider.id,
          price: service.price,
        } 
      },
    };
  }

  async handleBookingDescription(text, user, state) {
    if (text.length < 10) {
      return {
        text: 'Please provide more details about what you need (at least 10 characters).',
      };
    }

    return {
      text: 'Great! Now please share your location or type your address where the service is needed.',
      nextState: { 
        step: 'booking_location', 
        data: { 
          ...state.data, 
          description: text 
        } 
      },
    };
  }

  async handleBookingLocation(location, user, state) {
    const locationData = {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address || 'Location shared via WhatsApp',
    };

    return {
      text: 'Perfect! When would you like to schedule this service? Please provide your preferred date and time (e.g., "Tomorrow at 2 PM" or "Friday morning").',
      nextState: { 
        step: 'booking_date', 
        data: { 
          ...state.data, 
          location: locationData 
        } 
      },
    };
  }

  async handleBookingDate(text, user, state) {
    // Simple date parsing - in production, use a proper date parsing library
    const dateText = text.toLowerCase();
    let scheduledDate = new Date();

    if (dateText.includes('tomorrow')) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    } else if (dateText.includes('today')) {
      // Keep today's date
    } else {
      // For now, default to tomorrow if we can't parse
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    // Set a default time if not specified
    scheduledDate.setHours(10, 0, 0, 0);

    try {
      // Create the booking
      const booking = await Booking.create({
        clientId: user.id,
        providerId: state.data.providerId,
        serviceId: state.data.serviceId,
        title: `Service Request`,
        description: state.data.description,
        scheduledDate: scheduledDate,
        location: state.data.location,
        amount: state.data.price,
        status: 'pending',
      });

      // Initiate payment
      const paymentResult = await paymentService.initiatePayment({
        bookingId: booking.id,
        amount: state.data.price,
        phoneNumber: user.phoneNumber,
      });

      if (paymentResult.success) {
        return {
          text: `🎉 Booking created successfully!\n\n📋 Booking ID: ${booking.id}\n💰 Amount: KES ${state.data.price}\n📅 Scheduled: ${scheduledDate.toLocaleDateString()}\n\n📱 Please complete payment on your phone. You'll receive an M-Pesa prompt shortly.`,
          nextState: { step: 'main_menu', data: {} },
        };
      } else {
        return {
          text: `Booking created but payment initiation failed. Please contact support with booking ID: ${booking.id}`,
          nextState: { step: 'main_menu', data: {} },
        };
      }
    } catch (error) {
      logger.error('Booking creation error:', error);
      return {
        text: 'Sorry, there was an error creating your booking. Please try again later.',
        nextState: { step: 'main_menu', data: {} },
      };
    }
  }

  async startProviderRegistration(user) {
    if (!user?.isVerified) {
      return {
        text: 'Please complete your registration first. What\'s your full name?',
        nextState: { step: 'registration_name', data: { becomeProvider: true } },
      };
    }

    // Check if user is already a provider
    const existingProvider = await ServiceProvider.findOne({ where: { userId: user.id } });
    if (existingProvider) {
      return {
        text: 'You are already registered as a service provider! You can manage your services and bookings through the provider dashboard.',
        buttons: [
          { id: 'my_bookings', title: '📋 My Bookings' },
          { id: 'help', title: '❓ Help' },
        ],
      };
    }

    return {
      text: '🎉 Great! Let\'s get you registered as a service provider.\n\nFirst, what\'s your business name? (This is how clients will see you)',
      nextState: { step: 'provider_registration_business', data: {} },
    };
  }

  async handleProviderBusinessName(text, user, state) {
    if (text.length < 2) {
      return {
        text: 'Please provide a valid business name (at least 2 characters).',
      };
    }

    return {
      text: 'Perfect! Now tell me about your services and experience. What do you specialize in?',
      nextState: { 
        step: 'provider_registration_description', 
        data: { businessName: text } 
      },
    };
  }

  async handleProviderDescription(text, user, state) {
    if (text.length < 20) {
      return {
        text: 'Please provide more details about your services (at least 20 characters).',
      };
    }

    return {
      text: 'Excellent! What\'s your hourly rate in KES? (e.g., 500)',
      nextState: { 
        step: 'provider_registration_rate', 
        data: { 
          ...state.data, 
          description: text 
        } 
      },
    };
  }

  async handleProviderRate(text, user, state) {
    const rate = parseFloat(text.replace(/[^\d.]/g, ''));
    
    if (isNaN(rate) || rate < 50) {
      return {
        text: 'Please provide a valid hourly rate (minimum KES 50).',
      };
    }

    try {
      // Create service provider profile
      const provider = await ServiceProvider.create({
        userId: user.id,
        businessName: state.data.businessName,
        description: state.data.description,
        hourlyRate: rate,
        isVerified: false,
        isActive: true,
      });

      return {
        text: `🎉 Congratulations! Your provider profile has been created.\n\n📋 Business: ${state.data.businessName}\n💰 Rate: KES ${rate}/hour\n\n⏳ Your profile is under review and will be activated within 24 hours. You'll receive a notification once approved.\n\nThank you for joining our platform!`,
        buttons: [
          { id: 'help', title: '❓ Get Help' },
        ],
        nextState: { step: 'main_menu', data: {} },
      };
    } catch (error) {
      logger.error('Provider registration error:', error);
      return {
        text: 'Sorry, there was an error creating your provider profile. Please try again later.',
        nextState: { step: 'main_menu', data: {} },
      };
    }
  }

  async handleRegistrationName(text, user, state) {
    const names = text.trim().split(' ');
    if (names.length < 2) {
      return {
        text: 'Please provide your full name (first and last name).',
      };
    }

    const firstName = names[0];
    const lastName = names.slice(1).join(' ');

    try {
      // Update user with name and verify
      await user.update({
        firstName: firstName,
        lastName: lastName,
        isVerified: true,
      });

      const welcomeText = `Nice to meet you, ${firstName}! Your registration is complete. 🎉`;

      if (state.data.becomeProvider) {
        return {
          text: `${welcomeText}\n\nNow let's set up your service provider profile. What's your business name?`,
          nextState: { step: 'provider_registration_business', data: {} },
        };
      }

      return {
        text: `${welcomeText}\n\nHow can I help you today?`,
        buttons: [
          { id: 'book_service', title: '🔍 Find Services' },
          { id: 'become_provider', title: '💼 Become Provider' },
          { id: 'help', title: '❓ Help' },
        ],
        nextState: { step: 'main_menu', data: {} },
      };
    } catch (error) {
      logger.error('Registration error:', error);
      return {
        text: 'Sorry, there was an error completing your registration. Please try again.',
      };
    }
  }

  async showUserBookings(user) {
    if (!user?.isVerified) {
      return {
        text: 'Please complete your registration first.',
        nextState: { step: 'registration_name', data: {} },
      };
    }

    const bookings = await Booking.findAll({
      where: { clientId: user.id },
      include: [
        {
          model: Service,
          as: 'service',
          attributes: ['title'],
        },
        {
          model: ServiceProvider,
          as: 'provider',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    if (bookings.length === 0) {
      return {
        text: 'You don\'t have any bookings yet. Would you like to find a service?',
        buttons: [
          { id: 'book_service', title: '🔍 Find Services' },
          { id: 'help', title: '❓ Help' },
        ],
      };
    }

    let bookingsList = '📋 *Your Recent Bookings:*\n\n';
    
    bookings.forEach((booking, index) => {
      const providerName = `${booking.provider.user.firstName} ${booking.provider.user.lastName}`;
      const statusEmoji = {
        pending: '⏳',
        confirmed: '✅',
        in_progress: '🔄',
        completed: '✅',
        cancelled: '❌',
      }[booking.status] || '📋';

      bookingsList += `${index + 1}. ${statusEmoji} ${booking.service.title}\n`;
      bookingsList += `   Provider: ${providerName}\n`;
      bookingsList += `   Amount: KES ${booking.amount}\n`;
      bookingsList += `   Status: ${booking.status.replace('_', ' ')}\n`;
      bookingsList += `   Date: ${booking.scheduledDate.toLocaleDateString()}\n\n`;
    });

    return {
      text: bookingsList,
      buttons: [
        { id: 'book_service', title: '🔍 Book New Service' },
        { id: 'help', title: '❓ Get Help' },
      ],
    };
  }

  async showHelp() {
    const helpText = `
🆘 *Help & Support*

*How to book a service:*
1. Click "Find Services"
2. Choose a category
3. Select a service provider
4. Provide job details
5. Share your location
6. Choose date/time
7. Complete payment

*How to become a provider:*
1. Click "Become Provider"
2. Complete registration
3. Set your rates
4. Wait for approval (24hrs)
5. Start receiving bookings

*Payment:*
- We accept M-Pesa payments
- Payment is required to confirm booking
- Refunds available for cancellations

*Support:*
- Business hours: 8 AM - 8 PM
- Response time: Within 2 hours
- Emergency support available

Need more help? Type "support" to speak with our team.
    `.trim();

    return {
      text: helpText,
      buttons: [
        { id: 'book_service', title: '🔍 Find Services' },
        { id: 'become_provider', title: '💼 Become Provider' },
      ],
    };
  }

  async handleDefault(text, user) {
    const supportKeywords = ['support', 'help', 'problem', 'issue', 'contact'];
    
    if (supportKeywords.some(keyword => text.includes(keyword))) {
      return this.showHelp();
    }

    return {
      text: 'I didn\'t understand that. Here\'s what I can help you with:',
      buttons: [
        { id: 'book_service', title: '🔍 Find Services' },
        { id: 'become_provider', title: '💼 Become Provider' },
        { id: 'my_bookings', title: '📋 My Bookings' },
        { id: 'help', title: '❓ Help' },
      ],
      nextState: { step: 'main_menu', data: {} },
    };
  }
}

module.exports = new ConversationHandler();