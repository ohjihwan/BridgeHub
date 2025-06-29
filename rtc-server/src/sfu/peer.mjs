import * as logger from '../util/logger.mjs';

export default class Peer {
  constructor(sendTransport, recvTransport) {
    this.sendTransport = sendTransport;
    this.recvTransport = recvTransport;
    this.producers = new Map();
    this.consumers = new Map();
    this.closed = false;
  }

  async produce({ kind, rtpParameters, appData }) {
    try {
      if (this.closed || !this.sendTransport) {
        throw new Error('Peer is closed or send transport not available');
      }

      const producer = await this.sendTransport.produce({ 
        kind, 
        rtpParameters, 
        appData 
      });
      
      this.producers.set(kind, producer);
      
      producer.on('transportclose', () => {
        logger.debug(`Producer transport closed for kind: ${kind}`);
        this.producers.delete(kind);
      });

      logger.debug(`Producer created for kind: ${kind}, id: ${producer.id}`);
      return producer;
    } catch (error) {
      logger.error(`Error creating producer for kind ${kind}:`, error);
      throw error;
    }
  }

  async consume({ producerId, rtpCapabilities, kind }) {
    try {
      if (this.closed || !this.recvTransport) {
        throw new Error('Peer is closed or recv transport not available');
      }

      if (!this.recvTransport.canConsume({ producerId, rtpCapabilities })) {
        throw new Error('Cannot consume this producer');
      }

      const consumer = await this.recvTransport.consume({ 
        producerId, 
        rtpCapabilities, 
        paused: false 
      });
      
      this.consumers.set(producerId, consumer);
      
      consumer.on('transportclose', () => {
        logger.debug(`Consumer transport closed for producer: ${producerId}`);
        this.consumers.delete(producerId);
      });

      consumer.on('producerclose', () => {
        logger.debug(`Producer closed for consumer: ${consumer.id}`);
        this.consumers.delete(producerId);
      });

      logger.debug(`Consumer created for producer: ${producerId}, consumer id: ${consumer.id}`);
      return consumer;
    } catch (error) {
      logger.error(`Error creating consumer for producer ${producerId}:`, error);
      throw error;
    }
  }

  getProducer(kind) {
    return this.producers.get(kind);
  }

  getConsumer(producerId) {
    return this.consumers.get(producerId);
  }

  getAllProducers() {
    return Array.from(this.producers.values());
  }

  getAllConsumers() {
    return Array.from(this.consumers.values());
  }

  async pauseProducer(kind) {
    const producer = this.producers.get(kind);
    if (producer && !producer.paused) {
      await producer.pause();
      logger.debug(`Producer paused for kind: ${kind}`);
    }
  }

  async resumeProducer(kind) {
    const producer = this.producers.get(kind);
    if (producer && producer.paused) {
      await producer.resume();
      logger.debug(`Producer resumed for kind: ${kind}`);
    }
  }

  async pauseConsumer(producerId) {
    const consumer = this.consumers.get(producerId);
    if (consumer && !consumer.paused) {
      await consumer.pause();
      logger.debug(`Consumer paused for producer: ${producerId}`);
    }
  }

  async resumeConsumer(producerId) {
    const consumer = this.consumers.get(producerId);
    if (consumer && consumer.paused) {
      await consumer.resume();
      logger.debug(`Consumer resumed for producer: ${producerId}`);
    }
  }

  close() {
    if (this.closed) return;
    
    this.closed = true;
    
    for (const producer of this.producers.values()) {
      producer.close();
    }
    this.producers.clear();
    
    for (const consumer of this.consumers.values()) {
      consumer.close();
    }
    this.consumers.clear();
    
    if (this.sendTransport) {
      this.sendTransport.close();
    }
    if (this.recvTransport) {
      this.recvTransport.close();
    }
    
    logger.debug('Peer closed');
  }
}
